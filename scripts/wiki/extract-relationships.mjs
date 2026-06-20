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
  'Relationships',
  'Relationships/Spouses',
  'Dating App',
  'Marriage Proposal',
  'Fertility',
  'Adoption',
];

const records = [];
for (const title of sources) {
  const page = await readIndexedPage(title);
  const preHeadingListTerms =
    title === 'Fertility'
      ? extractListTerms(page.text).filter((item) => !['Trivia', 'Gallery'].includes(item.section) && item.level === 1)
      : [];
  const candidates = [
    ...extractHeadings(page.text, {
      minLevel: 2,
      maxLevel: 4,
      exclude: ['Gallery', 'Trivia', 'References', 'Options'],
    }),
    ...extractTableFirstCells(page.text),
    ...extractBullets(page.text).filter((item) => item.section && item.level === 1),
    ...preHeadingListTerms,
  ];

  records.push(...recordsFromCandidates(page, candidates, 'relationship'));
}

await writeExtract('relationships.json', records);
console.log(`Wrote ${records.length} relationship draft candidates.`);
