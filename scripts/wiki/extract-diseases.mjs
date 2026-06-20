import {
  extractBullets,
  extractHeadings,
  extractTableFirstCells,
  readIndexedPage,
  recordsFromCandidates,
  writeExtract,
} from './wiki-utils.mjs';

const sources = [
  { title: 'Diseases', category: 'disease' },
  { title: 'Medical Doctor', category: 'medical-treatment' },
  { title: 'Alternative Doctor', category: 'alternative-treatment' },
];

const records = [];
for (const source of sources) {
  const page = await readIndexedPage(source.title);
  const candidates = [
    ...extractHeadings(page.text, {
      minLevel: 2,
      maxLevel: 4,
      exclude: ['Gallery', 'References', 'Trivia', 'List of Symptoms in BitLife'],
    }),
    ...extractTableFirstCells(page.text),
    ...extractBullets(page.text).filter((item) => item.section && item.level <= 2),
  ];

  records.push(...recordsFromCandidates(page, candidates, source.category));
}

await writeExtract('diseases.json', records);
console.log(`Wrote ${records.length} disease draft candidates.`);
