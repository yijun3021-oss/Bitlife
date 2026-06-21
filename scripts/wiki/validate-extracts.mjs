import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { wikiExtractDir } from './wiki-utils.mjs';

const files = [
  'careers.json',
  'relationships.json',
  'assets.json',
  'diseases.json',
  'crime-prison.json',
  'achievements.json',
  'countries.json',
];

const requiredFields = [
  'sourcePage',
  'sourceTitle',
  'sourceSection',
  'rawName',
  'normalizedId',
  'category',
  'notes',
  'status',
];

let failed = false;

for (const file of files) {
  const fullPath = path.join(wikiExtractDir, file);
  let records;
  try {
    records = JSON.parse(await readFile(fullPath, 'utf8'));
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    failed = true;
    continue;
  }

  if (!Array.isArray(records)) {
    console.error(`${file}: expected a JSON array.`);
    failed = true;
    continue;
  }

  records.forEach((record, index) => {
    for (const field of requiredFields) {
      if (!(field in record)) {
        console.error(`${file}[${index}]: missing required field "${field}".`);
        failed = true;
      }
    }

    if (record.status !== 'draft') {
      console.error(`${file}[${index}]: expected status "draft".`);
      failed = true;
    }
  });

  console.log(`${file}: ${records.length} records`);
}

if (failed) {
  process.exitCode = 1;
}
