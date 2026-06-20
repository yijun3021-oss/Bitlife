import {
  extractBullets,
  extractHeadings,
  extractTableFirstCells,
  readIndexedPage,
  recordsFromCandidates,
  writeExtract,
} from './wiki-utils.mjs';

const sources = [
  { title: 'Careers', category: 'career', mode: 'headings' },
  { title: 'Careers/Jobs', category: 'job', mode: 'tables' },
  { title: 'Careers/Job activities', category: 'job-activity', mode: 'mixed' },
];

const records = [];
for (const source of sources) {
  const page = await readIndexedPage(source.title);
  const headings = extractHeadings(page.text, {
    minLevel: 2,
    maxLevel: 4,
    exclude: ['Interviews', 'Gallery', 'Trivia', 'Notes', 'References'],
  });
  const tables = extractTableFirstCells(page.text);
  const bullets = extractBullets(page.text).filter((item) => item.section && item.level <= 2);
  const candidates =
    source.mode === 'headings' ? headings : source.mode === 'tables' ? tables : [...tables, ...headings, ...bullets];

  records.push(...recordsFromCandidates(page, candidates, source.category));
}

await writeExtract('careers.json', records);
console.log(`Wrote ${records.length} career draft candidates.`);
