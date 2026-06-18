# BitLife Wiki Downloader

Downloads pages and media files from the BitLife Fandom wiki using the MediaWiki API.

## Current Dump

The downloaded data lives in `wiki_dump/`:

- `pages/`: one JSON file per wiki page, including title, namespace, ids, and wikitext content.
- `manifest.json`: index of downloaded pages.
- `files/`: downloaded File namespace media assets.
- `files_manifest.json`: index of downloaded media files and source URLs.

## Recommended Windows Usage

Use the bundled Node runtime from Codex Desktop or any local Node.js 18+ install.

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'

# Download all wiki pages in all public namespaces.
node download_wiki.mjs --output-dir wiki_dump --all-namespaces

# Download media files from the File namespace.
node download_wiki_files.mjs --output-dir wiki_dump
```

The TLS environment variable is needed in this workspace because the local Node runtime cannot verify Fandom's certificate chain. It only applies to the current terminal session.

## Other Options

```powershell
# Download only main article pages.
node download_wiki.mjs --output-dir wiki_dump --namespaces 0

# Test with a small number of pages or files.
node download_wiki.mjs --output-dir wiki_dump_test --limit 5 --refresh
node download_wiki_files.mjs --output-dir wiki_dump_test --limit 3
```

The Python and PowerShell scripts are kept as alternative downloaders, but the Node scripts were the ones verified in this workspace.

## P0 Game Prototype

Run the mobile-first P0 prototype:

`npm install`

`npm run dev`

Open the local URL shown by Vite. Use a mobile-width viewport around 390 x 844 for primary QA.
