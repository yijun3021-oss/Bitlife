# P1 Wiki-Backed Life Sim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete P1 Wiki-backed single-player life simulation described in `docs/superpowers/specs/2026-06-20-p1-wiki-backed-life-sim-design.md`.

**Architecture:** Keep the existing React/Vite/Zustand PWA, then add a Wiki content pipeline, typed catalog layer, `LifeState` v2 migration, modular pure game systems, and mobile-first UI panels. The work is intentionally split into independently testable phases because P1 includes several large subsystems: content pipeline, education/career, relationships/family, assets/licenses, health/diseases, crime/prison, achievements, and UI.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Vitest, Testing Library, localStorage or IndexedDB, Node scripts, Git.

---

## Scope Check

The P1 spec covers multiple independent subsystems. Treat this file as the master execution plan and create focused child implementation plans only when a phase becomes large enough to require parallel work. Each phase below must leave the app in a runnable, testable state and must not merge P2/P3 systems into the P1 definition.

Execution order is strict:

1. Tooling and repository gates.
2. Wiki dump restoration.
3. Wiki index and extraction pipeline.
4. Catalog schema and validation.
5. `LifeState` v2 migration.
6. System modules.
7. Store actions.
8. UI panels.
9. Content scale-up.
10. Final verification.

## File Structure

Create and modify these areas:

```text
docs/superpowers/specs/2026-06-20-p1-wiki-backed-life-sim-design.md
docs/superpowers/plans/2026-06-20-p1-wiki-backed-life-sim.md
data/wiki-index/
data/wiki-extracts/
scripts/wiki/build-index.mjs
scripts/wiki/extract-careers.mjs
scripts/wiki/extract-relationships.mjs
scripts/wiki/extract-assets.mjs
scripts/wiki/extract-diseases.mjs
scripts/wiki/extract-crime-prison.mjs
scripts/wiki/extract-achievements.mjs
scripts/wiki/extract-countries.mjs
scripts/wiki/validate-extracts.mjs
src/content/schema/sourceRefs.ts
src/content/schema/catalogTypes.ts
src/content/schema/catalogValidation.ts
src/content/catalog/careers.ts
src/content/catalog/education.ts
src/content/catalog/relationships.ts
src/content/catalog/assets.ts
src/content/catalog/diseases.ts
src/content/catalog/crimes.ts
src/content/catalog/prison.ts
src/content/catalog/achievements.ts
src/content/catalog/countries.ts
src/content/catalog/events.ts
src/game/lifeStateV2.ts
src/game/migrations.ts
src/game/systems/educationSystem.ts
src/game/systems/careerSystem.ts
src/game/systems/relationshipSystem.ts
src/game/systems/familySystem.ts
src/game/systems/assetSystem.ts
src/game/systems/healthSystem.ts
src/game/systems/crimeSystem.ts
src/game/systems/prisonSystem.ts
src/game/systems/achievementSystem.ts
src/game/systems/countrySystem.ts
src/game/engine.ts
src/store/lifeStore.ts
src/ui/SchoolWorkPanel.tsx
src/ui/RelationshipsPanel.tsx
src/ui/ActivityPanel.tsx
src/ui/Dashboard.tsx
src/ui/DeathSummary.tsx
src/ui/ProfilePanel.tsx
src/ui/panels/AssetsPanel.tsx
src/ui/panels/HealthPanel.tsx
src/ui/panels/CrimePanel.tsx
src/ui/panels/PrisonPanel.tsx
src/ui/panels/AchievementsPanel.tsx
src/i18n/locales/zh-CN.ts
src/i18n/locales/en-US.ts
src/game/*.test.ts
src/content/schema/*.test.ts
src/ui/*.test.tsx
```

Boundaries:

- `scripts/wiki/*` only reads raw Wiki files and writes generated intermediate JSON.
- `data/wiki-extracts/*` is reviewable intermediate data, not runtime code.
- `src/content/schema/*` defines and validates catalog contracts.
- `src/content/catalog/*` contains game-ready configuration and source references.
- `src/game/systems/*` contains pure TypeScript rules and no React imports.
- `src/store/lifeStore.ts` persists state and delegates rules to the engine.
- `src/ui/*` renders state and calls store actions.

## Task 0: Tooling and Git Gate

**Files:**
- Modify: `.gitignore`
- Verify: `package.json`

- [ ] **Step 1: Confirm Node and npm are available**

Run:

```powershell
Get-Command node -All
Get-Command npm -All
node --version
npm --version
```

Expected: commands print executable paths and versions. If they do not, install Node.js LTS or add the existing Node installation to PATH before continuing.

- [ ] **Step 2: Confirm Git path and local author identity**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' config user.name
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' config user.email
```

Expected: both commands print configured values. If either is blank, stop implementation and ask the user for exact repository-local Git identity values before running commits.

- [ ] **Step 3: Protect raw dump and generated folders**

Add or confirm these lines in `.gitignore`:

```gitignore
wiki_dump/
data/wiki-index/
data/wiki-extracts/
```

Expected: raw and generated data do not enter commits unless the user explicitly chooses to version a small reviewed sample.

- [ ] **Step 4: Run baseline verification**

Run:

```powershell
npm test
npm run build
```

Expected: tests and build pass before P1 work begins.

- [ ] **Step 5: Commit tooling gate**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add .gitignore docs/superpowers/specs/2026-06-20-p1-wiki-backed-life-sim-design.md docs/superpowers/plans/2026-06-20-p1-wiki-backed-life-sim.md
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "docs: plan p1 wiki-backed life sim"
```

## Task 1: Restore Wiki Dump

**Files:**
- Verify: `download_wiki.mjs`
- Verify: `download_wiki_files.mjs`
- Generated: `wiki_dump/manifest.json`
- Generated: `wiki_dump/files_manifest.json`
- Generated: `wiki_dump/pages/*.json`

- [ ] **Step 1: Check whether the dump already exists**

Run:

```powershell
Test-Path wiki_dump
Get-ChildItem wiki_dump -ErrorAction SilentlyContinue | Select-Object -First 10
```

Expected: either `wiki_dump` exists with manifests and page files, or the first command prints `False`.

- [ ] **Step 2: Rebuild dump if missing**

Run:

```powershell
node download_wiki.mjs
node download_wiki_files.mjs
```

Expected: scripts produce `wiki_dump/manifest.json`, `wiki_dump/pages`, and `wiki_dump/files_manifest.json`.

- [ ] **Step 3: Verify dump shape**

Run:

```powershell
Test-Path wiki_dump/manifest.json
Test-Path wiki_dump/files_manifest.json
Get-ChildItem wiki_dump/pages -Filter *.json | Measure-Object
```

Expected: manifest checks return `True`; page count is large enough to cover the feature matrix source pages.

- [ ] **Step 4: Record dump status**

Create `data/wiki-extracts/dump-status.json` with this shape after the dump is available:

```json
{
  "generatedAt": "2026-06-20",
  "manifestPath": "wiki_dump/manifest.json",
  "filesManifestPath": "wiki_dump/files_manifest.json",
  "pagesPath": "wiki_dump/pages",
  "status": "available"
}
```

- [ ] **Step 5: Commit dump gate metadata**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add data/wiki-extracts/dump-status.json
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "chore: record wiki dump availability"
```

## Task 2: Build Wiki Index

**Files:**
- Create: `scripts/wiki/build-index.mjs`
- Generated: `data/wiki-index/pages.json`
- Generated: `data/wiki-index/p1-source-pages.json`

- [ ] **Step 1: Add a script that indexes page metadata**

Create `scripts/wiki/build-index.mjs`:

```js
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pagesDir = path.join(root, 'wiki_dump', 'pages');
const outDir = path.join(root, 'data', 'wiki-index');
const requiredTitles = [
  'Careers',
  'Careers/Jobs',
  'Careers/Job activities',
  'Relationships',
  'Relationships/Spouses',
  'Dating App',
  'Marriage Proposal',
  'Fertility',
  'Adoption',
  'Assets',
  'Money',
  'Licenses',
  'Diseases',
  'Medical Doctor',
  'Alternative Doctor',
  'Crime',
  'Prison',
  'Prison/Activities',
  'Achievements',
  'Countries',
];

function normalizeTitle(title) {
  return String(title ?? '').trim().replace(/_/g, ' ').toLowerCase();
}

function pageText(page) {
  return page?.parse?.wikitext?.['*'] ?? page?.wikitext ?? page?.text ?? '';
}

await mkdir(outDir, { recursive: true });
const files = (await readdir(pagesDir)).filter((file) => file.endsWith('.json'));
const pages = [];

for (const file of files) {
  const fullPath = path.join(pagesDir, file);
  const raw = JSON.parse(await readFile(fullPath, 'utf8'));
  const title = raw.title ?? raw.parse?.title ?? path.basename(file, '.json');
  pages.push({
    file,
    title,
    normalizedTitle: normalizeTitle(title),
    textLength: pageText(raw).length,
  });
}

const required = requiredTitles.map((title) => {
  const normalized = normalizeTitle(title);
  const match = pages.find((page) => page.normalizedTitle === normalized)
    ?? pages.find((page) => page.normalizedTitle.includes(normalized));
  return {
    title,
    found: Boolean(match),
    file: match?.file ?? null,
    matchedTitle: match?.title ?? null,
  };
});

await writeFile(path.join(outDir, 'pages.json'), JSON.stringify(pages, null, 2));
await writeFile(path.join(outDir, 'p1-source-pages.json'), JSON.stringify(required, null, 2));

const missing = required.filter((entry) => !entry.found);
if (missing.length > 0) {
  console.error(`Missing P1 source pages: ${missing.map((entry) => entry.title).join(', ')}`);
  process.exit(1);
}

console.log(`Indexed ${pages.length} pages and found ${required.length} P1 source pages.`);
```

- [ ] **Step 2: Run the index script**

Run:

```powershell
node scripts/wiki/build-index.mjs
```

Expected: prints page count and found source page count.

- [ ] **Step 3: Commit index script**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add scripts/wiki/build-index.mjs
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: index wiki source pages"
```

## Task 3: Extract P1 Intermediate Data

**Files:**
- Create: `scripts/wiki/extract-careers.mjs`
- Create: `scripts/wiki/extract-relationships.mjs`
- Create: `scripts/wiki/extract-assets.mjs`
- Create: `scripts/wiki/extract-diseases.mjs`
- Create: `scripts/wiki/extract-crime-prison.mjs`
- Create: `scripts/wiki/extract-achievements.mjs`
- Create: `scripts/wiki/extract-countries.mjs`
- Create: `scripts/wiki/validate-extracts.mjs`
- Generated: `data/wiki-extracts/*.json`

- [ ] **Step 1: Create the shared extraction helper**

Create `scripts/wiki/wiki-utils.mjs`:

```js
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export function normalizeId(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || 'entry';
}

export function getPageText(page) {
  return page?.parse?.wikitext?.['*'] ?? page?.wikitext ?? page?.text ?? '';
}

export async function readIndexedPage(title) {
  const indexPath = path.join(process.cwd(), 'data', 'wiki-index', 'p1-source-pages.json');
  const pages = JSON.parse(await readFile(indexPath, 'utf8'));
  const entry = pages.find((item) => item.title === title);
  if (!entry?.file) {
    throw new Error(`Missing indexed source page: ${title}`);
  }
  const pagePath = path.join(process.cwd(), 'wiki_dump', 'pages', entry.file);
  const page = JSON.parse(await readFile(pagePath, 'utf8'));
  return {
    file: entry.file,
    title: entry.matchedTitle ?? title,
    text: getPageText(page),
  };
}

export function extractBullets(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('*') || line.startsWith('#'))
    .map((line) => line.replace(/^[*#;\s]+/, '').replace(/\[\[|\]\]/g, '').trim())
    .filter(Boolean);
}

export function toDraftRecord(source, rawName, category, notes = '') {
  return {
    sourcePage: source.file,
    sourceTitle: source.title,
    sourceSection: category,
    rawName,
    normalizedId: normalizeId(rawName),
    category,
    notes,
    status: 'draft',
  };
}
```

- [ ] **Step 2: Add extraction scripts with explicit source pages**

Each extractor should follow this pattern:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { extractBullets, readIndexedPage, toDraftRecord } from './wiki-utils.mjs';

const outDir = path.join(process.cwd(), 'data', 'wiki-extracts');
await mkdir(outDir, { recursive: true });

const sources = [
  await readIndexedPage('Careers'),
  await readIndexedPage('Careers/Jobs'),
  await readIndexedPage('Careers/Job activities'),
];

const records = sources.flatMap((source) =>
  extractBullets(source.text).slice(0, 300).map((rawName) => toDraftRecord(source, rawName, 'career')),
);

await writeFile(path.join(outDir, 'careers.json'), JSON.stringify(records, null, 2));
console.log(`Extracted ${records.length} career records.`);
```

Use the same structure with these output files and source titles:

```text
relationships.json: Relationships, Relationships/Spouses, Dating App, Marriage Proposal, Fertility, Adoption
assets.json: Assets, Money, Licenses
diseases.json: Diseases, Medical Doctor, Alternative Doctor
crime-prison.json: Crime, Prison, Prison/Activities
achievements.json: Achievements
countries.json: Countries
```

- [ ] **Step 3: Validate extract shape**

Create `scripts/wiki/validate-extracts.mjs`:

```js
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data', 'wiki-extracts');
const files = (await readdir(dir)).filter((file) => file.endsWith('.json') && file !== 'dump-status.json');
const required = ['sourcePage', 'sourceTitle', 'sourceSection', 'rawName', 'normalizedId', 'category', 'notes', 'status'];

for (const file of files) {
  const rows = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
  if (!Array.isArray(rows)) {
    throw new Error(`${file} must contain an array`);
  }
  for (const [index, row] of rows.entries()) {
    for (const key of required) {
      if (!(key in row)) {
        throw new Error(`${file}[${index}] missing ${key}`);
      }
    }
  }
  const ids = rows.map((row) => row.normalizedId);
  if (new Set(ids).size !== ids.length) {
    console.warn(`${file} has duplicate normalized ids; review required before catalog generation.`);
  }
}

console.log(`Validated ${files.length} extract files.`);
```

- [ ] **Step 4: Run all extractors and validation**

Run:

```powershell
node scripts/wiki/extract-careers.mjs
node scripts/wiki/extract-relationships.mjs
node scripts/wiki/extract-assets.mjs
node scripts/wiki/extract-diseases.mjs
node scripts/wiki/extract-crime-prison.mjs
node scripts/wiki/extract-achievements.mjs
node scripts/wiki/extract-countries.mjs
node scripts/wiki/validate-extracts.mjs
```

Expected: each extractor prints a count; validation prints the number of extract files checked.

- [ ] **Step 5: Commit extraction scripts**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add scripts/wiki
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: extract p1 wiki source data"
```

## Task 4: Catalog Schema and Validation

**Files:**
- Create: `src/content/schema/sourceRefs.ts`
- Create: `src/content/schema/catalogTypes.ts`
- Create: `src/content/schema/catalogValidation.ts`
- Create: `src/content/schema/catalogValidation.test.ts`

- [ ] **Step 1: Write failing schema validation tests**

Create `src/content/schema/catalogValidation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateCatalogIds, validateLocaleKeys, validateSourceRefs } from './catalogValidation';
import type { CatalogItem } from './catalogTypes';

const item: CatalogItem = {
  id: 'cashier',
  titleKey: 'career.cashier.title',
  sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }],
};

describe('catalog validation', () => {
  it('accepts unique ids', () => {
    expect(validateCatalogIds([item])).toEqual([]);
  });

  it('reports duplicate ids', () => {
    expect(validateCatalogIds([item, item])).toEqual(['Duplicate catalog id: cashier']);
  });

  it('requires source refs', () => {
    expect(validateSourceRefs([{ ...item, sourceRefs: [] }])).toEqual(['cashier is missing sourceRefs']);
  });

  it('checks locale keys in both dictionaries', () => {
    const result = validateLocaleKeys([item], { 'career.cashier.title': '收银员' }, {});
    expect(result).toEqual(['Missing en-US locale key: career.cashier.title']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/content/schema/catalogValidation.test.ts
```

Expected: FAIL because schema files do not exist.

- [ ] **Step 3: Add catalog schema types**

Create `src/content/schema/sourceRefs.ts`:

```ts
export interface SourceRef {
  sourceTitle: string;
  sourcePage: string;
  sourceSection?: string;
}
```

Create `src/content/schema/catalogTypes.ts`:

```ts
import type { Attributes } from '../../game/types';
import type { SourceRef } from './sourceRefs';

export interface CatalogItem {
  id: string;
  titleKey: string;
  summaryKey?: string;
  sourceRefs: SourceRef[];
}

export interface RequirementConfig {
  minAge?: number;
  maxAge?: number;
  minAttributes?: Partial<Attributes>;
  statuses?: string[];
  missingStatuses?: string[];
}

export interface EffectConfig {
  attributes?: Partial<Attributes>;
  money?: number;
  addStatus?: string;
  removeStatus?: string;
}
```

Create `src/content/schema/catalogValidation.ts`:

```ts
import type { CatalogItem } from './catalogTypes';

export function validateCatalogIds(items: CatalogItem[]): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`Duplicate catalog id: ${item.id}`);
    }
    seen.add(item.id);
  }
  return errors;
}

export function validateSourceRefs(items: CatalogItem[]): string[] {
  return items
    .filter((item) => item.sourceRefs.length === 0)
    .map((item) => `${item.id} is missing sourceRefs`);
}

export function validateLocaleKeys(
  items: CatalogItem[],
  zhCN: Record<string, string>,
  enUS: Record<string, string>,
): string[] {
  const keys = new Set<string>();
  for (const item of items) {
    keys.add(item.titleKey);
    if (item.summaryKey !== undefined) {
      keys.add(item.summaryKey);
    }
  }
  const errors: string[] = [];
  for (const key of keys) {
    if (!(key in zhCN)) {
      errors.push(`Missing zh-CN locale key: ${key}`);
    }
    if (!(key in enUS)) {
      errors.push(`Missing en-US locale key: ${key}`);
    }
  }
  return errors;
}
```

- [ ] **Step 4: Run schema tests**

Run:

```powershell
npm test -- src/content/schema/catalogValidation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit schema layer**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/schema
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 catalog schema"
```

## Task 5: Seed P1 Catalogs

**Files:**
- Create: `src/content/catalog/careers.ts`
- Create: `src/content/catalog/education.ts`
- Create: `src/content/catalog/relationships.ts`
- Create: `src/content/catalog/assets.ts`
- Create: `src/content/catalog/diseases.ts`
- Create: `src/content/catalog/crimes.ts`
- Create: `src/content/catalog/prison.ts`
- Create: `src/content/catalog/achievements.ts`
- Create: `src/content/catalog/countries.ts`
- Create: `src/content/catalog/events.ts`
- Create: `src/content/catalog/catalog.test.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en-US.ts`

- [ ] **Step 1: Write failing catalog coverage tests**

Create `src/content/catalog/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { achievements } from './achievements';
import { assets } from './assets';
import { careers } from './careers';
import { countries } from './countries';
import { crimes } from './crimes';
import { diseases } from './diseases';
import { educationPrograms } from './education';
import { p1Events } from './events';
import { prisonActivities } from './prison';
import { relationshipEventConfigs } from './relationships';

describe('p1 seed catalogs', () => {
  it('ships a small verified seed for every P1 catalog before scale-up', () => {
    expect(careers.length).toBeGreaterThanOrEqual(5);
    expect(educationPrograms.length).toBeGreaterThanOrEqual(3);
    expect(relationshipEventConfigs.length).toBeGreaterThanOrEqual(3);
    expect(assets.length).toBeGreaterThanOrEqual(5);
    expect(diseases.length).toBeGreaterThanOrEqual(5);
    expect(crimes.length).toBeGreaterThanOrEqual(5);
    expect(prisonActivities.length).toBeGreaterThanOrEqual(3);
    expect(achievements.length).toBeGreaterThanOrEqual(5);
    expect(countries.length).toBeGreaterThanOrEqual(3);
    expect(p1Events.length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL because catalog files do not exist.

- [ ] **Step 3: Add initial catalog files**

Add seed catalog entries with the shared fields `id`, `titleKey`, and `sourceRefs`. Keep the seed small in this task; scale-up happens after systems are playable.

Example for `src/content/catalog/careers.ts`:

```ts
import type { CatalogItem } from '../schema/catalogTypes';

export interface CareerCatalogItem extends CatalogItem {
  salary: number;
  smartsMin: number;
  educationLevel: 'none' | 'community_college' | 'university';
  tier: number;
}

export const careers: CareerCatalogItem[] = [
  { id: 'cashier', titleKey: 'career.cashier.title', salary: 18000, smartsMin: 0, educationLevel: 'none', tier: 1, sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }] },
  { id: 'office_assistant', titleKey: 'career.officeAssistant.title', salary: 26000, smartsMin: 35, educationLevel: 'none', tier: 1, sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }] },
  { id: 'nurse_assistant', titleKey: 'career.nurseAssistant.title', salary: 34000, smartsMin: 45, educationLevel: 'community_college', tier: 2, sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }] },
  { id: 'software_analyst', titleKey: 'career.softwareAnalyst.title', salary: 62000, smartsMin: 65, educationLevel: 'university', tier: 3, sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }] },
  { id: 'junior_law_clerk', titleKey: 'career.juniorLawClerk.title', salary: 52000, smartsMin: 70, educationLevel: 'university', tier: 3, sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }] },
];
```

- [ ] **Step 4: Add locale keys for seed catalogs**

Add matching keys to both locale files. Example:

```ts
'career.cashier.title': 'Cashier',
'career.officeAssistant.title': 'Office Assistant',
'career.nurseAssistant.title': 'Nurse Assistant',
'career.softwareAnalyst.title': 'Software Analyst',
'career.juniorLawClerk.title': 'Junior Law Clerk',
```

Use original Chinese translations in `zh-CN.ts`, not copied Wiki phrasing.

- [ ] **Step 5: Run catalog tests**

Run:

```powershell
npm test -- src/content/catalog/catalog.test.ts src/content/schema/catalogValidation.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit seed catalogs**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 seed catalogs"
```

## Task 6: LifeState v2 and Migration

**Files:**
- Create: `src/game/lifeStateV2.ts`
- Create: `src/game/migrations.ts`
- Create: `src/game/migrations.test.ts`
- Modify: `src/store/lifeStore.ts`

- [ ] **Step 1: Write failing migration tests**

Create `src/game/migrations.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from './engine';
import { migrateLifeState } from './migrations';

describe('life state migration', () => {
  it('migrates v1 life state into v2 with P1 containers', () => {
    const v1 = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    const v2 = migrateLifeState(v1);

    expect(v2.version).toBe(2);
    expect(v2.education).toBeDefined();
    expect(v2.career).toBeDefined();
    expect(v2.family).toBeDefined();
    expect(v2.assets).toEqual([]);
    expect(v2.health.diseases).toEqual([]);
    expect(v2.criminalRecord.convictions).toEqual([]);
    expect(v2.achievements.unlocked).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/game/migrations.test.ts
```

Expected: FAIL because migration files do not exist.

- [ ] **Step 3: Add v2 state type**

Create `src/game/lifeStateV2.ts` with explicit P1 containers:

```ts
import type { LifeState } from './types';

export interface LifeStateV2 extends Omit<LifeState, 'version'> {
  version: 2;
  education: { level: 'none' | 'community_college' | 'university'; majorId: string | null; grade: number; stress: number; graduated: boolean };
  career: { currentJobId: string | null; performance: number; yearsInRole: number; retired: boolean };
  family: { spouseId: string | null; childrenIds: string[]; marriageCount: number; divorceCount: number; adoptionCount: number };
  assets: Array<{ id: string; catalogId: string; value: number; purchaseAge: number }>;
  licenses: Record<'driving' | 'boat' | 'flight', boolean>;
  health: { diseases: Array<{ diseaseId: string; severity: number; discoveredAge: number; treated: boolean }>; treatmentHistory: string[] };
  criminalRecord: { arrests: number; convictions: Array<{ crimeId: string; age: number; sentenceYears: number }> };
  prison: { incarcerated: boolean; remainingYears: number; behavior: number; appealAvailable: boolean; paroleEligible: boolean };
  achievements: { unlocked: Array<{ achievementId: string; age: number }> };
  stats: { totalIncome: number; workYears: number; crimesSucceeded: number; prisonYears: number; diseasesRecovered: number };
}
```

- [ ] **Step 4: Add migration function**

Create `src/game/migrations.ts`:

```ts
import type { LifeState } from './types';
import type { LifeStateV2 } from './lifeStateV2';

export function migrateLifeState(life: LifeState | LifeStateV2): LifeStateV2 {
  if (life.version === 2) {
    return life;
  }

  return {
    ...life,
    version: 2,
    education: { level: 'none', majorId: null, grade: life.school.grade, stress: life.school.stress, graduated: life.school.stage === 'finished' },
    career: { currentJobId: life.job?.jobId ?? null, performance: 50, yearsInRole: life.job?.years ?? 0, retired: false },
    family: { spouseId: null, childrenIds: [], marriageCount: 0, divorceCount: 0, adoptionCount: 0 },
    assets: [],
    licenses: { driving: false, boat: false, flight: false },
    health: { diseases: [], treatmentHistory: [] },
    criminalRecord: { arrests: 0, convictions: [] },
    prison: { incarcerated: false, remainingYears: 0, behavior: 50, appealAvailable: false, paroleEligible: false },
    achievements: { unlocked: [] },
    stats: { totalIncome: 0, workYears: life.job?.years ?? 0, crimesSucceeded: 0, prisonYears: 0, diseasesRecovered: 0 },
  };
}
```

- [ ] **Step 5: Run migration tests**

Run:

```powershell
npm test -- src/game/migrations.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit migration**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/lifeStateV2.ts src/game/migrations.ts src/game/migrations.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 life state migration"
```

## Task 7: Split Engine into System Modules

**Files:**
- Create: `src/game/systems/*.ts`
- Create: `src/game/systems/*.test.ts`
- Modify: `src/game/engine.ts`

- [ ] **Step 1: Create child plans before coding large systems**

Create one focused plan before implementing each subsystem:

```text
docs/superpowers/plans/2026-06-20-p1-education-career.md
docs/superpowers/plans/2026-06-20-p1-relationships-family.md
docs/superpowers/plans/2026-06-20-p1-assets-health.md
docs/superpowers/plans/2026-06-20-p1-crime-prison-achievements.md
docs/superpowers/plans/2026-06-20-p1-ui-integration.md
docs/superpowers/plans/2026-06-20-p1-content-scale-up.md
```

Each child plan must include exact tests, files, commands, and commit boundaries for its subsystem.

- [ ] **Step 2: Implement systems in dependency order**

Build systems in this order:

```text
countrySystem
educationSystem
careerSystem
relationshipSystem
familySystem
assetSystem
healthSystem
crimeSystem
prisonSystem
achievementSystem
```

Expected: each system has its own `*.test.ts`, exports pure functions, and accepts `LifeStateV2` plus catalog config.

- [ ] **Step 3: Keep engine as orchestrator**

Refactor `ageUp` so it delegates yearly settlement in this order:

```ts
settleEducationYear
settleCareerYear
settleAssetYear
settleHealthYear
settleCrimeAndPrisonYear
settleRelationshipYear
unlockAchievements
pickNextEvent
```

- [ ] **Step 4: Run full game test suite after each system**

Run:

```powershell
npm test -- src/game
npm run build
```

Expected: system tests pass and TypeScript build succeeds after each subsystem is added.

- [ ] **Step 5: Commit after each system**

Use these commit messages:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 country system"
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 education and career systems"
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 relationship and family systems"
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 asset and health systems"
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 crime prison and achievement systems"
```

## Task 8: Store Actions and Save Compatibility

**Files:**
- Modify: `src/store/lifeStore.ts`
- Create: `src/store/lifeStore.p1.test.ts`

- [ ] **Step 1: Add store tests for migration and P1 actions**

Create `src/store/lifeStore.p1.test.ts` with tests for:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('p1 life store', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates a v2 life after P1 migration is wired', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });
    expect(useLifeStore.getState().life?.version).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails before store wiring**

Run:

```powershell
npm test -- src/store/lifeStore.p1.test.ts
```

Expected: FAIL until `createLife`, `loadLife`, and save normalization use `migrateLifeState`.

- [ ] **Step 3: Wire store to migration and P1 actions**

Modify `src/store/lifeStore.ts` so:

```ts
import { migrateLifeState } from '../game/migrations';
```

Then ensure `createLife`, `loadLife`, and `continueLife` store `LifeStateV2`. Add actions for education, career, assets, health, crime, prison, and achievements only after corresponding system modules exist.

- [ ] **Step 4: Run store tests**

Run:

```powershell
npm test -- src/store/lifeStore.test.ts src/store/lifeStore.p1.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit store wiring**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/store src/game/migrations.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: wire p1 state into store"
```

## Task 9: P1 UI Panels

**Files:**
- Modify: `src/ui/SchoolWorkPanel.tsx`
- Modify: `src/ui/RelationshipsPanel.tsx`
- Modify: `src/ui/ActivityPanel.tsx`
- Modify: `src/ui/Dashboard.tsx`
- Modify: `src/ui/DeathSummary.tsx`
- Create: `src/ui/ProfilePanel.tsx`
- Create: `src/ui/panels/AssetsPanel.tsx`
- Create: `src/ui/panels/HealthPanel.tsx`
- Create: `src/ui/panels/CrimePanel.tsx`
- Create: `src/ui/panels/PrisonPanel.tsx`
- Create: `src/ui/panels/AchievementsPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/ui/App.p1.test.tsx`

- [ ] **Step 1: Write UI smoke tests for P1 sections**

Create `src/ui/App.p1.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('P1 app shell', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('shows P1 profile sections after life creation', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText('姓名'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: '创建人生' }));
    await userEvent.click(screen.getByRole('button', { name: '档案' }));
    expect(screen.getByText('成就')).toBeInTheDocument();
    expect(screen.getByText('资产')).toBeInTheDocument();
    expect(screen.getByText('健康')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/ui/App.p1.test.tsx
```

Expected: FAIL until P1 panels are wired.

- [ ] **Step 3: Build UI panels in this order**

Implement panels in this order so each one can render independently:

```text
ProfilePanel
AchievementsPanel
AssetsPanel
HealthPanel
CrimePanel
PrisonPanel
SchoolWorkPanel upgrade
RelationshipsPanel upgrade
ActivityPanel upgrade
DeathSummary upgrade
```

Each panel must:

- Receive state via props.
- Show locked reasons for unavailable actions.
- Use `translate(locale, key)` for visible text.
- Avoid calculating rules that belong in `src/game/systems/*`.

- [ ] **Step 4: Run UI tests and build**

Run:

```powershell
npm test -- src/ui/App.test.tsx src/ui/App.p1.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit UI panels**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/App.tsx src/ui src/styles.css src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 mobile panels"
```

## Task 10: Content Scale-Up

**Files:**
- Modify: `src/content/catalog/*.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/content/catalog/catalog.test.ts`

- [ ] **Step 1: Raise catalog coverage targets**

Update `src/content/catalog/catalog.test.ts` to assert:

```ts
expect(careers.length).toBeGreaterThanOrEqual(50);
expect(educationPrograms.length).toBeGreaterThanOrEqual(20);
expect(relationshipEventConfigs.length).toBeGreaterThanOrEqual(80);
expect(assets.length).toBeGreaterThanOrEqual(50);
expect(diseases.length).toBeGreaterThanOrEqual(40);
expect(crimes.length).toBeGreaterThanOrEqual(20);
expect(prisonActivities.length).toBeGreaterThanOrEqual(40);
expect(achievements.length).toBeGreaterThanOrEqual(80);
expect(p1Events.length).toBeGreaterThanOrEqual(150);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL until content scale-up reaches P1 targets.

- [ ] **Step 3: Fill catalog from reviewed extracts**

Use `data/wiki-extracts/*.json` as source references. Each catalog entry should follow this concrete pattern:

```ts
{
  id: 'cashier',
  titleKey: 'career.cashier.title',
  summaryKey: 'career.cashier.summary',
  sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: '167_CareersJobs.json' }]
}
```

Keep player-facing text in locale files and write original phrasing in both languages.

- [ ] **Step 4: Run content validation**

Run:

```powershell
npm test -- src/content/schema src/content/catalog src/i18n
```

Expected: PASS and no missing locale keys.

- [ ] **Step 5: Commit content batches**

Commit in batches:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/careers.ts src/content/catalog/education.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 education and career content"

& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/relationships.ts src/content/catalog/assets.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 relationship and asset content"

& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/diseases.ts src/content/catalog/crimes.ts src/content/catalog/prison.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 health crime and prison content"

& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/achievements.ts src/content/catalog/events.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 achievements and events"
```

## Task 11: End-to-End Verification

**Files:**
- Modify: `README.md`
- Create: `docs/p1-qa-checklist.md`

- [ ] **Step 1: Add QA checklist**

Create `docs/p1-qa-checklist.md`:

```md
# P1 QA Checklist

- Create a new life in zh-CN.
- Age to 18 while handling yearly events.
- Apply to university or community college.
- Graduate or enter direct work.
- Get a job, earn salary, and attempt promotion.
- Create a friend or partner relationship.
- Marry, divorce, have a child, or complete an adoption.
- Buy at least one asset and sell one asset.
- Acquire at least one license.
- Contract or trigger a disease and treat it.
- Commit a crime, handle arrest, trial, and sentencing.
- Enter prison, attempt appeal or parole, and leave prison.
- Unlock at least five achievements.
- Die and review P1 death summary.
- Switch to en-US and verify visible labels still render.
- Check 390 x 844 viewport for overlap.
```

- [ ] **Step 2: Run full automated verification**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 3: Run manual verification**

Run:

```powershell
npm run dev
```

Open Vite's local URL and complete every item in `docs/p1-qa-checklist.md`.

- [ ] **Step 4: Commit final docs**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add README.md docs/p1-qa-checklist.md
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "docs: add p1 qa checklist"
```

## Plan Self-Review

Spec coverage:

- Wiki dump restoration is covered by Tasks 1 through 3.
- Catalog schema, source refs, and locale validation are covered by Tasks 4 and 5.
- `LifeState` v2 and save migration are covered by Tasks 6 and 8.
- Education, career, relationships, family, assets, health, crime, prison, achievements, and country systems are covered by Task 7 and required child plans.
- P1 UI panels and mobile shell are covered by Task 9.
- Product-level content scale-up targets are covered by Task 10.
- Final automated and manual QA are covered by Task 11.

Specificity scan:

- The plan avoids open-ended sections and names exact files, commands, tests, and commit boundaries.
- Values that require user identity are explicitly constrained to Git config and must be resolved before commits.

Type consistency:

- `LifeStateV2` is introduced before store and UI wiring.
- Catalog entries use `sourceRefs`, `titleKey`, and optional `summaryKey` consistently.
- System modules depend on `LifeStateV2` and catalog config, while UI depends on store actions.
