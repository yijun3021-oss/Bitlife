import {
  extractBullets,
  extractHeadings,
  extractTableFirstCells,
  readIndexedPage,
  recordsFromCandidates,
  writeExtract,
} from './wiki-utils.mjs';

const sources = ['Assets', 'Money', 'Licenses'];
const records = [];

for (const title of sources) {
  const page = await readIndexedPage(title);
  const category = title === 'Money' ? 'money' : title === 'Licenses' ? 'license' : 'asset';
  const candidates = [
    ...extractHeadings(page.text, {
      minLevel: 2,
      maxLevel: 4,
      exclude: ['Gallery', 'References', 'Trivia'],
    }),
    ...extractTableFirstCells(page.text),
    ...extractBullets(page.text).filter((item) => item.section && item.level === 1),
  ];

  records.push(...recordsFromCandidates(page, candidates, category));
}

await writeExtract('assets.json', records);
console.log(`Wrote ${records.length} asset draft candidates.`);
