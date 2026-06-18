Param(
    [string]$OutputDir = "wiki_dump",
    [int]$Limit = 0,
    [string]$Namespaces = "0",
    [switch]$AllNamespaces,
    [switch]$Refresh
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$api = 'https://bitlife-life-simulator.fandom.com/api.php'
$headers = @{
    'User-Agent' = 'bitliffe-wiki-downloader/1.0 (personal research)'
    'Accept' = 'application/json'
    'Referer' = 'https://bitlife-life-simulator.fandom.com/'
}

function ConvertTo-SafeFileName([string]$Value) {
    $safe = $Value.Replace(' ', '_') -replace '[^A-Za-z0-9_\-\.]', ''
    if ($safe.Length -gt 180) { return $safe.Substring(0, 180) }
    if ($safe.Length -eq 0) { return 'untitled' }
    return $safe
}

function Invoke-WikiApi([hashtable]$Params) {
    $query = ($Params.GetEnumerator() | ForEach-Object {
        "$($_.Key)=$([uri]::EscapeDataString(($_.Value).ToString()))"
    }) -join '&'
    $uri = "$api`?$query"

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            return Invoke-RestMethod -Uri $uri -Headers $headers -ErrorAction Stop -TimeoutSec 60
        } catch {
            if ($attempt -eq 3) { throw }
            Start-Sleep -Seconds ($attempt * 2)
        }
    }
}

function Get-WikiNamespaces {
    $resp = Invoke-WikiApi @{
        action = 'query'
        format = 'json'
        meta = 'siteinfo'
        siprop = 'namespaces'
    }
    return $resp.query.namespaces.PSObject.Properties.Name |
        Where-Object { [int]$_ -ge 0 } |
        ForEach-Object { [int]$_ } |
        Sort-Object
}

function Get-RevisionContent($Page) {
    if (-not $Page.revisions -or $Page.revisions.Count -eq 0) { return '' }
    $revision = $Page.revisions[0]
    if ($revision.slots -and $revision.slots.main) {
        $main = $revision.slots.main
        if ($main.content) { return $main.content }
        if ($main.'*') { return $main.'*' }
    }
    if ($revision.'*') { return $revision.'*' }
    return ''
}

function Write-Manifest([string]$BaseDir, [string]$PagesDir) {
    $manifest = Get-ChildItem -Path $PagesDir -Filter *.json | Sort-Object Name | ForEach-Object {
        $json = Get-Content -Path $_.FullName -Raw | ConvertFrom-Json
        [PSCustomObject]@{
            pageid = $json.pageid
            title = $json.title
            ns = $json.ns
            file = "pages/$($_.Name)"
        }
    }
    $manifest | ConvertTo-Json -Depth 8 | Out-File -FilePath (Join-Path $BaseDir 'manifest.json') -Encoding utf8
    return @($manifest).Count
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$pagesDir = Join-Path $OutputDir 'pages'
New-Item -ItemType Directory -Force -Path $pagesDir | Out-Null

if ($AllNamespaces) {
    $namespaceList = @(Get-WikiNamespaces)
} else {
    $namespaceList = @($Namespaces.Split(',') | ForEach-Object { [int]$_.Trim() })
}

$saved = 0
$skipped = 0
Write-Host "Downloading namespaces: $($namespaceList -join ', ')"

foreach ($namespace in $namespaceList) {
    Write-Host "Namespace $namespace`: listing and fetching pages..."
    $continue = $null

    while ($true) {
        $params = @{
            action = 'query'
            format = 'json'
            formatversion = '2'
            generator = 'allpages'
            gaplimit = '50'
            gapnamespace = $namespace
            prop = 'revisions'
            rvprop = 'ids|timestamp|user|content'
            rvslots = 'main'
        }
        if ($continue) { $params['gapcontinue'] = $continue }

        $resp = Invoke-WikiApi $params
        if (-not $resp.query.pages) { break }

        foreach ($p in $resp.query.pages) {
            if ($Limit -gt 0 -and $saved -ge $Limit) { break }

            $safe = "$( $p.pageid )_$(ConvertTo-SafeFileName $p.title)".Replace(' ', '')
            $path = Join-Path $pagesDir "$safe.json"
            if (-not $Refresh -and (Test-Path $path)) {
                $skipped++
                continue
            }

            $obj = [PSCustomObject]@{
                pageid = $p.pageid
                title = $p.title
                ns = $p.ns
                touched = $p.touched
                lastrevid = $p.lastrevid
                content = (Get-RevisionContent $p)
            }
            $obj | ConvertTo-Json -Depth 15 | Out-File -FilePath $path -Encoding utf8
            $saved++
            if ($saved % 50 -eq 0) {
                Write-Host "Saved $saved new pages ($skipped skipped)..."
            }
        }

        if ($Limit -gt 0 -and $saved -ge $Limit) { break }
        if ($resp.'continue' -and $resp.'continue'.gapcontinue) {
            $continue = $resp.'continue'.gapcontinue
            Start-Sleep -Milliseconds 200
        } else {
            break
        }
    }

    if ($Limit -gt 0 -and $saved -ge $Limit) { break }
}

$manifestCount = Write-Manifest $OutputDir $pagesDir
Write-Host "Done. Saved $saved new pages, skipped $skipped, manifest has $manifestCount pages."
