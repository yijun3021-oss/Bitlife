import {
  extractBullets,
  extractHeadings,
  extractListTerms,
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
  let candidates = [
    ...extractHeadings(page.text, {
      minLevel: 2,
      maxLevel: 4,
      exclude: ['Gallery', 'References', 'Trivia', 'List of Symptoms in BitLife'],
    }),
    ...extractTableFirstCells(page.text),
    ...extractBullets(page.text).filter((item) => item.section && item.level <= 2),
  ];

  if (source.title === 'Alternative Doctor') {
    candidates = [...candidates, ...extractListTerms(page.text).filter((item) => item.level === 1)];
  }

  if (candidates.length === 0) {
    candidates = [{ rawName: page.title, section: '' }];
  }

  records.push(...recordsFromCandidates(page, candidates, source.category));
}

await writeExtract('diseases.json', records);
console.log(`Wrote ${records.length} disease draft candidates.`);
