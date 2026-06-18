#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const API_ENDPOINT = "https://bitlife-life-simulator.fandom.com/api.php";
const USER_AGENT = "bitliffe-wiki-file-downloader/1.0 (personal research)";

function getArg(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function safeFilename(value) {
  const safe = value.replace(/^File:/, "").replaceAll(" ", "_").replace(/[^A-Za-z0-9_\-.]+/g, "");
  return safe.slice(0, 180) || "file";
}

async function apiGet(params) {
  const url = new URL(API_ENDPOINT);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          referer: "https://bitlife-life-simulator.fandom.com/",
          "user-agent": USER_AGENT,
        },
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }
  throw lastError;
}

async function downloadFile(url, filePath) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "*/*",
          referer: "https://bitlife-life-simulator.fandom.com/",
          "user-agent": USER_AGENT,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, bytes);
      return bytes.length;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }
  throw lastError;
}

async function main() {
  const outputDir = getArg("--output-dir", "wiki_dump");
  const limit = Number(getArg("--limit", "0"));
  const filesDir = path.join(outputDir, "files");
  await fs.mkdir(filesDir, { recursive: true });

  const manifest = [];
  let continuation;
  let saved = 0;
  let skipped = 0;
  let failed = 0;

  while (true) {
    const params = {
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "allpages",
      gaplimit: "50",
      gapnamespace: "6",
      prop: "imageinfo",
      iiprop: "url|mime|size",
      origin: "*",
    };
    if (continuation) {
      params.gapcontinue = continuation;
    }

    const data = await apiGet(params);
    const pages = data.query?.pages ?? [];
    for (const page of pages) {
      if (limit > 0 && saved >= limit) break;

      const info = page.imageinfo?.[0];
      if (!info?.url) continue;

      const fileName = `${page.pageid}_${safeFilename(page.title)}`;
      const filePath = path.join(filesDir, fileName);
      let localSize = 0;
      try {
        const stat = await fs.stat(filePath);
        localSize = stat.size;
        skipped += 1;
      } catch {
        try {
          localSize = await downloadFile(info.url, filePath);
          saved += 1;
          if (saved % 50 === 0) {
            console.log(`Saved ${saved} files...`);
          }
        } catch (error) {
          failed += 1;
          console.warn(`Failed ${page.title}: ${error.message}`);
          continue;
        }
      }

      manifest.push({
        pageid: page.pageid,
        title: page.title,
        mime: info.mime,
        expectedSize: info.size,
        downloadedSize: localSize,
        sourceUrl: info.url,
        file: `files/${fileName}`,
      });
    }

    if (limit > 0 && saved >= limit) break;
    continuation = data.continue?.gapcontinue;
    if (!continuation) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  await fs.writeFile(
    path.join(outputDir, "files_manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(`Done. Saved ${saved} files, skipped ${skipped}, failed ${failed}, manifest has ${manifest.length} files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
