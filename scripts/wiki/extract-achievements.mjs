import {
  extractHeadings,
  extractTableFirstCells,
  readIndexedPage,
  recordsFromCandidates,
  writeExtract,
} from './wiki-utils.mjs';

const page = await readIndexedPage('Achievements');
const candidates = [
  ...extractTableFirstCells(page.text),
  ...extractHeadings(page.text, {
    minLevel: 3,
    maxLevel: 3,
    exclude: ['Gallery', 'References', 'Trivia'],
  }),
];

await writeExtract('achievements.json', recordsFromCandidates(page, candidates, 'achievement'));
console.log(`Wrote ${candidates.length} achievement draft candidates.`);
