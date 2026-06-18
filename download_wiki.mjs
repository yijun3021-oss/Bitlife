#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const API_ENDPOINT = "https://bitlife-life-simulator.fandom.com/api.php";
const USER_AGENT = "bitliffe-wiki-downloader/1.0 (personal research)";

function getArg(name, fallback = undefined) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function safeFilename(value) {
  const safe = value.replaceAll(" ", "_").replace(/[^A-Za-z0-9_\-.]+/g, "").slice(0, 180);
  return safe || "untitled";
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
      if (!text) {
        throw new Error("empty response body");
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

async function getNamespaces() {
  const data = await apiGet({
    action: "query",
    format: "json",
    meta: "siteinfo",
    siprop: "namespaces",
    origin: "*",
  });
  return Object.keys(data.query?.namespaces ?? {})
    .map((value) => Number(value))
    .filter((value) => value >= 0)
    .sort((a, b) => a - b);
}

function extractContent(page) {
  const revision = page.revisions?.[0];
  const main = revision?.slots?.main;
  return main?.content ?? main?.["*"] ?? revision?.["*"] ?? "";
}

async function writeManifest(outputDir, pagesDir) {
  const files = (await fs.readdir(pagesDir)).filter((file) => file.endsWith(".json")).sort();
  const manifest = [];
  for (const file of files) {
    try {
      const page = JSON.parse(await fs.readFile(path.join(pagesDir, file), "utf8"));
      manifest.push({
        pageid: page.pageid,
        title: page.title,
        ns: page.ns,
        file: `pages/${file}`,
      });
    } catch {
      // Ignore partial files from interrupted runs.
    }
  }
  await fs.writeFile(
    path.join(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return manifest.length;
}

async function downloadNamespace(namespace, pagesDir, options) {
  let continuation;
  let saved = 0;
  let skipped = 0;

  while (true) {
    const params = {
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "allpages",
      gaplimit: "50",
      gapnamespace: namespace,
      prop: "revisions",
      rvprop: "ids|timestamp|user|content",
      rvslots: "main",
      origin: "*",
    };
    if (continuation) {
      params.gapcontinue = continuation;
    }

    const data = await apiGet(params);
    const pages = data.query?.pages ?? [];
    for (const page of pages) {
      if (options.limit > 0 && options.totalSaved >= options.limit) {
        return { saved, skipped, done: true };
      }

      const file = `${page.pageid}_${safeFilename(page.title)}.json`;
      const filePath = path.join(pagesDir, file);
      if (!options.refresh) {
        try {
          await fs.access(filePath);
          skipped += 1;
          continue;
        } catch {
          // File does not exist yet.
        }
      }

      const output = {
        pageid: page.pageid,
        title: page.title,
        ns: page.ns,
        touched: page.touched,
        lastrevid: page.lastrevid,
        content: extractContent(page),
      };
      await fs.writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
      saved += 1;
      options.totalSaved += 1;
      if (options.totalSaved % 50 === 0) {
        console.log(`Saved ${options.totalSaved} new pages...`);
      }
    }

    continuation = data.continue?.gapcontinue;
    if (!continuation) {
      return { saved, skipped, done: false };
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function main() {
  const outputDir = getArg("--output-dir", "wiki_dump");
  const limit = Number(getArg("--limit", "0"));
  const namespaceArg = getArg("--namespaces", "0");
  const refresh = hasFlag("--refresh");
  const allNamespaces = hasFlag("--all-namespaces");
  const namespaces = allNamespaces
    ? await getNamespaces()
    : namespaceArg.split(",").map((value) => Number(value.trim())).filter(Number.isFinite);

  const pagesDir = path.join(outputDir, "pages");
  await fs.mkdir(pagesDir, { recursive: true });

  const options = { limit, refresh, totalSaved: 0 };
  let totalSkipped = 0;

  console.log(`Downloading namespaces: ${namespaces.join(", ")}`);
  for (const namespace of namespaces) {
    console.log(`Namespace ${namespace}: listing and fetching pages...`);
    const result = await downloadNamespace(namespace, pagesDir, options);
    totalSkipped += result.skipped;
    if (result.done) break;
  }

  const manifestCount = await writeManifest(outputDir, pagesDir);
  console.log(
    `Done. Saved ${options.totalSaved} new pages, skipped ${totalSkipped}, manifest has ${manifestCount} pages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
