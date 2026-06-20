import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const wikiIndexDir = path.resolve(process.env.WIKI_INDEX_DIR ?? path.join(repoRoot, 'data/wiki-index'));
export const wikiDumpDir = path.resolve(process.env.WIKI_DUMP_DIR ?? path.join(repoRoot, 'wiki_dump'));
export const wikiExtractDir = path.resolve(
  process.env.WIKI_EXTRACT_DIR ?? path.join(repoRoot, 'data/wiki-extracts'),
);

const pagesDir = path.join(wikiDumpDir, 'pages');

function normalizeTitle(title) {
  return String(title ?? '')
    .normalize('NFKC')
    .trim()
    .replaceAll('_', '/')
    .replaceAll(/\s*\/\s*/g, '/')
    .replaceAll(/\s+/g, ' ')
    .toLowerCase();
}

function stripWikiMarkup(value) {
  return String(value ?? '')
    .replaceAll(/<ref\b[^>]*>.*?<\/ref>/gis, '')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\{\{[^{}]*\}\}/g, '')
    .replaceAll(/\[\[File:[^\]]+\]\]/gi, '')
    .replaceAll(/\[\[Category:[^\]]+\]\]/gi, '')
    .replaceAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replaceAll(/\[\[([^\]]+)\]\]/g, '$1')
    .replaceAll(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1')
    .replaceAll(/\[https?:\/\/[^\]]+\]/g, '')
    .replaceAll(/'{2,}/g, '')
    .replaceAll(/&nbsp;/gi, ' ')
    .replaceAll(/&amp;/gi, '&')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function cleanName(value) {
  return stripWikiMarkup(value)
    .replaceAll(/^[#*;:+\s]+/g, '')
    .replaceAll(/\s*\([^)]*edit[^)]*\)\s*/gi, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .replaceAll(/^[,.;:|/-]+|[,.;:|/-]+$/g, '')
    .trim();
}

function isLikelyEntityName(value) {
  if (!value || value.length < 2 || value.length > 90) {
    return false;
  }

  if (/^(yes|no|none|unknown|description|chance-based|difficulty|date added|currency)$/i.test(value)) {
    return false;
  }

  if (/^list of\b/i.test(value)) {
    return false;
  }

  return /[A-Za-z0-9]/.test(value);
}

function parseHeading(line) {
  const match = line.match(/^(={2,6})\s*(.*?)\s*\1\s*$/);
  if (!match) {
    return null;
  }

  return {
    level: match[1].length,
    title: cleanName(match[2]),
  };
}

function cleanTableCell(cell) {
  let value = String(cell ?? '').trim();
  value = value.replaceAll(/^!+\s*/g, '').replaceAll(/^\|+\s*/g, '');

  const pipeIndex = value.indexOf('|');
  const equalsIndex = value.indexOf('=');
  if (pipeIndex >= 0 && (equalsIndex >= 0 && equalsIndex < pipeIndex)) {
    value = value.slice(pipeIndex + 1);
  }

  return cleanName(value);
}

export function normalizeId(value) {
  return stripWikiMarkup(value)
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/&/g, ' and ')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');
}

export function getPageText(page) {
  for (const key of ['content', 'text', 'extract']) {
    if (typeof page?.[key] === 'string') {
      return page[key];
    }
  }

  return '';
}

export async function readIndexedPage(title) {
  const sourcePages = JSON.parse(await readFile(path.join(wikiIndexDir, 'p1-source-pages.json'), 'utf8'));
  const pages = JSON.parse(await readFile(path.join(wikiIndexDir, 'pages.json'), 'utf8'));
  const wanted = normalizeTitle(title);
  const indexed = sourcePages.find(
    (page) => normalizeTitle(page.requiredTitle) === wanted || normalizeTitle(page.title) === wanted,
  );

  if (!indexed) {
    throw new Error(`No indexed P1 source page found for "${title}".`);
  }

  const page = JSON.parse(await readFile(path.join(pagesDir, indexed.file), 'utf8'));
  let text = getPageText(page);
  const redirect = text.match(/^#REDIRECT\s+\[\[([^\]]+)\]\]/i);
  let redirectedFrom = null;

  if (redirect) {
    redirectedFrom = {
      file: indexed.file,
      title: page.title ?? indexed.title,
    };
    const redirectTitle = redirect[1].split('|')[0];
    const redirectMatch = pages.find((candidate) => normalizeTitle(candidate.title) === normalizeTitle(redirectTitle));
    if (redirectMatch) {
      const redirectPage = JSON.parse(await readFile(path.join(pagesDir, redirectMatch.file), 'utf8'));
      text = getPageText(redirectPage);
    }
  }

  return {
    ...indexed,
    page,
    text,
    redirectedFrom,
  };
}

export function extractBullets(text) {
  const records = [];
  let section = '';

  for (const line of String(text ?? '').split(/\r?\n/)) {
    const heading = parseHeading(line.trim());
    if (heading?.title) {
      section = heading.title;
      continue;
    }

    const match = line.match(/^\s*([*#]+)\s*(.+?)\s*;?\s*$/);
    if (!match) {
      continue;
    }

    const rawName = cleanName(match[2]);
    if (isLikelyEntityName(rawName)) {
      records.push({ rawName, section, level: match[1].length });
    }
  }

  return records;
}

export function extractHeadings(text, { minLevel = 2, maxLevel = 4, exclude = [] } = {}) {
  const excluded = exclude.map((item) => normalizeId(item));
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => parseHeading(line.trim()))
    .filter((heading) => heading && heading.level >= minLevel && heading.level <= maxLevel)
    .map((heading) => ({ rawName: heading.title, section: heading.title, level: heading.level }))
    .filter(({ rawName }) => isLikelyEntityName(rawName) && !excluded.includes(normalizeId(rawName)));
}

export function extractTableFirstCells(text) {
  const records = [];
  let section = '';
  let cells = [];
  let inTable = false;

  function flushRow() {
    if (cells.length === 0) {
      return;
    }

    const rawName = cleanTableCell(cells[0]);
    if (isLikelyEntityName(rawName)) {
      records.push({ rawName, section });
    }
    cells = [];
  }

  for (const rawLine of String(text ?? '').split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = parseHeading(line);
    if (heading?.title) {
      section = heading.title;
      continue;
    }

    if (line.startsWith('{|')) {
      inTable = true;
      cells = [];
      continue;
    }

    if (!inTable) {
      continue;
    }

    if (line.startsWith('|-')) {
      flushRow();
      continue;
    }

    if (line.startsWith('|}')) {
      flushRow();
      inTable = false;
      continue;
    }

    if (line.startsWith('!')) {
      continue;
    }

    if (line.startsWith('|')) {
      const parts = line.includes('||') ? line.split('||') : [line];
      for (const part of parts) {
        const cell = cleanTableCell(part);
        if (cell) {
          cells.push(cell);
        }
      }
    }
  }
  flushRow();

  return records;
}

export function toDraftRecord(source, rawName, category, notes = '') {
  const sourceSection = source.sourceSection ?? source.section ?? '';
  return {
    sourcePage: source.sourcePage ?? source.requiredTitle ?? source.title,
    sourceTitle: source.sourceTitle ?? source.title,
    sourceSection,
    rawName: cleanName(rawName),
    normalizedId: normalizeId(rawName),
    category,
    notes,
    status: 'draft',
  };
}

export function uniqueDraftRecords(records) {
  const seen = new Set();
  const unique = [];

  for (const record of records) {
    if (!record.normalizedId) {
      continue;
    }

    const key = [record.category, record.normalizedId, record.sourcePage].join('|');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(record);
    }
  }

  return unique.sort((a, b) =>
    a.category.localeCompare(b.category) ||
    a.rawName.localeCompare(b.rawName) ||
    a.sourcePage.localeCompare(b.sourcePage),
  );
}

export async function writeExtract(filename, records) {
  await mkdir(wikiExtractDir, { recursive: true });
  await writeFile(path.join(wikiExtractDir, filename), `${JSON.stringify(uniqueDraftRecords(records), null, 2)}\n`);
}

export function recordsFromCandidates(page, candidates, category, notes = '') {
  return candidates.map((candidate) =>
    toDraftRecord(
      {
        sourcePage: page.requiredTitle,
        sourceTitle: page.title,
        sourceSection: candidate.section ?? '',
      },
      candidate.rawName,
      category,
      notes,
    ),
  );
}
