import {
  extractBullets,
  extractHeadings,
  extractTableFirstCells,
  readIndexedPage,
  recordsFromCandidates,
  writeExtract,
} from './wiki-utils.mjs';

const sources = [
  { title: 'Crime', category: 'crime' },
  { title: 'Prison', category: 'prison' },
  { title: 'Prison/Activities', category: 'prison-activity' },
];

const records = [];
for (const source of sources) {
  const page = await readIndexedPage(source.title);
  const candidates = [
    ...extractHeadings(page.text, {
      minLevel: 2,
      maxLevel: 4,
      exclude: ['Gallery', 'References', 'Trivia', 'Consequences'],
    }),
    ...extractTableFirstCells(page.text),
    ...extractBullets(page.text).filter((item) => item.section && item.level <= 2),
  ];

  records.push(...recordsFromCandidates(page, candidates, source.category));
}

await writeExtract('crime-prison.json', records);
console.log(`Wrote ${records.length} crime/prison draft candidates.`);
