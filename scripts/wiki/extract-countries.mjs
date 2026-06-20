import { extractTableFirstCells, readIndexedPage, recordsFromCandidates, writeExtract } from './wiki-utils.mjs';

const page = await readIndexedPage('Countries');
const candidates = extractTableFirstCells(page.text);

await writeExtract(
  'countries.json',
  recordsFromCandidates(page, candidates, 'country', page.redirectedFrom ? `Redirected from ${page.redirectedFrom.title}` : ''),
);
console.log(`Wrote ${candidates.length} country draft candidates.`);
