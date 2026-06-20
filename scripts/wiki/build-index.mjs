import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_TITLES = [
  'Careers',
  'Careers/Jobs',
  'Careers/Job activities',
  'Relationships',
  'Relationships/Spouses',
  'Dating App',
  'Marriage Proposal',
  'Fertility',
  'Adoption',
  'Assets',
  'Money',
  'Licenses',
  'Diseases',
  'Medical Doctor',
  'Alternative Doctor',
  'Crime',
  'Prison',
  'Prison/Activities',
  'Achievements',
  'Countries',
];

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dumpDir = path.resolve(process.env.WIKI_DUMP_DIR ?? path.join(repoRoot, 'wiki_dump'));
const pagesDir = path.join(dumpDir, 'pages');
const indexDir = path.resolve(process.env.WIKI_INDEX_DIR ?? path.join(repoRoot, 'data/wiki-index'));

function normalizeTitle(title) {
  return title
    .normalize('NFKC')
    .trim()
    .replaceAll('_', '/')
    .replaceAll(/\s*\/\s*/g, '/')
    .replaceAll(/\s+/g, ' ')
    .toLowerCase();
}

function matchingKeys(title) {
  const slashNormalized = normalizeTitle(title);
  const spaceNormalized = slashNormalized.replaceAll('/', ' ');
  return new Set([slashNormalized, spaceNormalized]);
}

function getText(page) {
  for (const key of ['content', 'text', 'extract']) {
    if (typeof page[key] === 'string') {
      return page[key];
    }
  }

  return '';
}

async function readPages() {
  const files = (await readdir(pagesDir))
    .filter((file) => file.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  const pages = [];
  for (const file of files) {
    const page = JSON.parse(await readFile(path.join(pagesDir, file), 'utf8'));
    const title = String(page.title ?? path.basename(file, '.json'));
    const text = getText(page);
    pages.push({
      file,
      title,
      normalizedTitle: normalizeTitle(title),
      textLength: text.length,
    });
  }

  return pages;
}

function buildLookup(pages) {
  const lookup = new Map();

  for (const page of pages) {
    for (const key of matchingKeys(page.title)) {
      if (!lookup.has(key)) {
        lookup.set(key, page);
      }
    }
  }

  return lookup;
}

function findRequiredPages(pages) {
  const lookup = buildLookup(pages);
  const sourcePages = [];
  const missing = [];

  for (const requiredTitle of REQUIRED_TITLES) {
    let match;
    for (const key of matchingKeys(requiredTitle)) {
      match = lookup.get(key);
      if (match) {
        break;
      }
    }

    if (match) {
      sourcePages.push({
        requiredTitle,
        ...match,
      });
    } else {
      missing.push(requiredTitle);
    }
  }

  return { sourcePages, missing };
}

async function main() {
  const pages = await readPages();
  const { sourcePages, missing } = findRequiredPages(pages);

  if (missing.length > 0) {
    console.error('Missing required wiki pages:');
    for (const title of missing) {
      console.error(`- ${title}`);
    }
    process.exitCode = 1;
    return;
  }

  await mkdir(indexDir, { recursive: true });
  await writeFile(path.join(indexDir, 'pages.json'), `${JSON.stringify(pages, null, 2)}\n`);
  await writeFile(path.join(indexDir, 'p1-source-pages.json'), `${JSON.stringify(sourcePages, null, 2)}\n`);

  console.log(`Indexed ${pages.length} wiki pages.`);
  console.log(`Selected ${sourcePages.length} P1 source pages.`);
}

await main();
