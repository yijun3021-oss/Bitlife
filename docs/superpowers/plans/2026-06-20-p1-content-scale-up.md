# P1 Content Scale Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand P1 reviewed runtime catalogs and validation targets after systems and UI are stable.

**Architecture:** Runtime catalog entries live in `src/content/catalog/*` and localized player-facing strings live in `src/i18n/locales/*`. Raw Wiki dump and generated extracts stay out of commits; workers may read reviewed extracts for source references but must author concise original gameplay text.

**Tech Stack:** TypeScript, Vitest, existing catalog validation helpers, existing i18n dictionaries, Git.

---

## Current Context

Existing files to rely on:

- `src/content/catalog/catalog.test.ts` currently validates seed catalog counts and source refs.
- `src/content/schema/catalogValidation.ts` validates ids, source references, and locale keys.
- `src/content/catalog/careers.ts`, `education.ts`, `relationships.ts`, `assets.ts`, `diseases.ts`, `crimes.ts`, `prison.ts`, `achievements.ts`, and `events.ts` contain seed runtime catalogs.
- `src/i18n/locales/en-US.ts` and `src/i18n/locales/zh-CN.ts` contain player-facing strings.

This plan starts after P1 systems and UI compile. Do not commit `wiki_dump`, `data/wiki-index`, or `data/wiki-extracts`.

## Files

- Modify: `src/content/catalog/catalog.test.ts`
- Modify: `src/content/catalog/careers.ts`
- Modify: `src/content/catalog/education.ts`
- Modify: `src/content/catalog/relationships.ts`
- Modify: `src/content/catalog/assets.ts`
- Modify: `src/content/catalog/diseases.ts`
- Modify: `src/content/catalog/crimes.ts`
- Modify: `src/content/catalog/prison.ts`
- Modify: `src/content/catalog/achievements.ts`
- Modify: `src/content/catalog/events.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

## Target Counts

Raise runtime catalog coverage to at least:

- Careers: 50
- Education programs: 20
- Relationship event configs: 80
- Assets: 50
- Diseases: 40
- Crimes: 20
- Prison activities: 40
- Achievements: 80
- P1 events: 150

## Task 1: Raise Validation Targets

**Files:**
- Modify: `src/content/catalog/catalog.test.ts`

- [ ] **Step 1: Write failing target assertions**

Modify the count test in `src/content/catalog/catalog.test.ts`:

```ts
it('ships full P1 catalog coverage after scale-up', () => {
  expect(careers.length).toBeGreaterThanOrEqual(50);
  expect(educationPrograms.length).toBeGreaterThanOrEqual(20);
  expect(relationshipEventConfigs.length).toBeGreaterThanOrEqual(80);
  expect(assets.length).toBeGreaterThanOrEqual(50);
  expect(diseases.length).toBeGreaterThanOrEqual(40);
  expect(crimes.length).toBeGreaterThanOrEqual(20);
  expect(prisonActivities.length).toBeGreaterThanOrEqual(40);
  expect(achievements.length).toBeGreaterThanOrEqual(80);
  expect(p1Events.length).toBeGreaterThanOrEqual(150);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL with count assertions below the new targets.

- [ ] **Step 3: Commit validation target change**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/catalog.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "test: raise p1 catalog coverage targets"
```

## Task 2: Expand Education and Career Catalogs

**Files:**
- Modify: `src/content/catalog/careers.ts`
- Modify: `src/content/catalog/education.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

- [ ] **Step 1: Add failing focused count test**

Temporarily run the existing target test from Task 1 with this command:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL on careers and education counts until this task is complete.

- [ ] **Step 2: Expand career entries**

Add enough `CareerCatalogItem` objects in `src/content/catalog/careers.ts` to reach 50 entries. Each entry must follow this exact shape:

```ts
{
  id: 'career.paramedic',
  titleKey: 'catalog.career.paramedic.title',
  summaryKey: 'catalog.career.paramedic.summary',
  salary: 42000,
  smartsMin: 45,
  educationLevel: 'community_college',
  tier: 2,
  sourceRefs: [{ sourceTitle: 'Careers/Jobs', sourcePage: 'Careers/Jobs' }],
}
```

Use varied `educationLevel`, `salary`, `smartsMin`, and `tier` values so career progression has meaningful choices.

- [ ] **Step 3: Expand education entries**

Add enough `EducationProgramCatalogItem` objects in `src/content/catalog/education.ts` to reach 20 entries. Each entry must follow this exact shape:

```ts
{
  id: 'education.nursing',
  titleKey: 'catalog.education.nursing.title',
  summaryKey: 'catalog.education.nursing.summary',
  level: 'community_college',
  minAge: 18,
  durationYears: 2,
  tuition: 9000,
  smartsMin: 45,
  sourceRefs: [{ sourceTitle: 'Careers', sourcePage: 'Careers', sourceSection: 'Education' }],
}
```

- [ ] **Step 4: Add locale keys**

For every new `titleKey` and `summaryKey`, add original English and Chinese strings to:

```text
src/i18n/locales/en-US.ts
src/i18n/locales/zh-CN.ts
```

Do not paste raw Wiki prose.

- [ ] **Step 5: Run catalog validation**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts src/content/schema/catalogValidation.test.ts src/i18n/i18n.test.ts
```

Expected: career and education counts pass; other catalog counts may still fail until later tasks.

- [ ] **Step 6: Commit education and career content**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/careers.ts src/content/catalog/education.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 education and career content"
```

## Task 3: Expand Relationships and Assets

**Files:**
- Modify: `src/content/catalog/relationships.ts`
- Modify: `src/content/catalog/assets.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

- [ ] **Step 1: Confirm current failures**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL on relationships, assets, and later catalog groups.

- [ ] **Step 2: Expand relationship event configs**

Add enough entries in `src/content/catalog/relationships.ts` to reach 80. Each entry must include id, locale keys, relationship category fields already used by the seed file, requirements or effects when supported by the local type, and source refs:

```ts
{
  id: 'relationship.partner_anniversary',
  titleKey: 'catalog.relationship.partnerAnniversary.title',
  summaryKey: 'catalog.relationship.partnerAnniversary.summary',
  type: 'romance',
  minAge: 18,
  effects: { attributes: { happiness: 4 } },
  sourceRefs: [{ sourceTitle: 'Relationships', sourcePage: 'Relationships' }],
}
```

Match the exact interface in `relationships.ts`; keep values deterministic and small.

- [ ] **Step 3: Expand assets**

Add enough entries in `src/content/catalog/assets.ts` to reach 50. Each entry must match the local `AssetCatalogItem` interface and include source refs:

```ts
{
  id: 'asset.compact_car',
  titleKey: 'catalog.asset.compactCar.title',
  summaryKey: 'catalog.asset.compactCar.summary',
  price: 12000,
  category: 'car',
  yearlyUpkeep: 750,
  sourceRefs: [{ sourceTitle: 'Assets', sourcePage: 'Assets' }],
}
```

- [ ] **Step 4: Add locale keys**

Add English and Chinese strings for every new relationship and asset title and summary key. Keep descriptions short enough for mobile cards.

- [ ] **Step 5: Run validation**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts src/content/schema/catalogValidation.test.ts src/i18n/i18n.test.ts
```

Expected: relationships and assets counts pass; health, crime, prison, achievements, and events may still fail.

- [ ] **Step 6: Commit relationship and asset content**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/relationships.ts src/content/catalog/assets.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 relationship and asset content"
```

## Task 4: Expand Health, Crime, and Prison

**Files:**
- Modify: `src/content/catalog/diseases.ts`
- Modify: `src/content/catalog/crimes.ts`
- Modify: `src/content/catalog/prison.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

- [ ] **Step 1: Confirm current failures**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL on diseases, crimes, prison activities, achievements, and events.

- [ ] **Step 2: Expand diseases**

Add enough entries in `src/content/catalog/diseases.ts` to reach 40. Each entry must match the seed interface:

```ts
{
  id: 'disease.migraine',
  titleKey: 'catalog.disease.migraine.title',
  summaryKey: 'catalog.disease.migraine.summary',
  severity: 'moderate',
  yearlyHealthImpact: -8,
  treatable: true,
  effects: { attributes: { happiness: -3 }, addStatus: 'sick' },
  sourceRefs: [{ sourceTitle: 'Diseases', sourcePage: 'Diseases' }],
}
```

- [ ] **Step 3: Expand crimes**

Add enough entries in `src/content/catalog/crimes.ts` to reach 20:

```ts
{
  id: 'crime.pickpocketing',
  titleKey: 'catalog.crime.pickpocketing.title',
  summaryKey: 'catalog.crime.pickpocketing.summary',
  severity: 'petty',
  minAge: 12,
  successChance: 0.65,
  sentenceYears: 1,
  effects: { money: 180, addStatus: 'suspicious' },
  sourceRefs: [{ sourceTitle: 'Crime', sourcePage: 'Crime' }],
}
```

- [ ] **Step 4: Expand prison activities**

Add enough entries in `src/content/catalog/prison.ts` to reach 40:

```ts
{
  id: 'prison.library_shift',
  titleKey: 'catalog.prison.libraryShift.title',
  summaryKey: 'catalog.prison.libraryShift.summary',
  risk: 'low',
  effects: { attributes: { smarts: 2, happiness: 1 } },
  sourceRefs: [{ sourceTitle: 'Prison/Activities', sourcePage: 'Prison/Activities' }],
}
```

- [ ] **Step 5: Add locale keys and run validation**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts src/content/schema/catalogValidation.test.ts src/i18n/i18n.test.ts
```

Expected: diseases, crimes, and prison counts pass; achievements and events may still fail.

- [ ] **Step 6: Commit health, crime, and prison content**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/diseases.ts src/content/catalog/crimes.ts src/content/catalog/prison.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 health crime and prison content"
```

## Task 5: Expand Achievements and Events

**Files:**
- Modify: `src/content/catalog/achievements.ts`
- Modify: `src/content/catalog/events.ts`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`

- [ ] **Step 1: Confirm current failures**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts
```

Expected: FAIL on achievements and P1 events.

- [ ] **Step 2: Expand achievements**

Add enough entries in `src/content/catalog/achievements.ts` to reach 80:

```ts
{
  id: 'achievement.first_home',
  titleKey: 'catalog.achievement.firstHome.title',
  summaryKey: 'catalog.achievement.firstHome.summary',
  category: 'wealth',
  targetValue: 1,
  sourceRefs: [{ sourceTitle: 'Achievements', sourcePage: 'Achievements' }],
}
```

Keep ids aligned with `achievementSystem.ts` when achievements require automatic unlock conditions. Achievements without implemented unlock conditions may remain visible as locked UI goals.

- [ ] **Step 3: Expand P1 events**

Add enough entries in `src/content/catalog/events.ts` to reach 150. Each event must match the local `p1Events` item interface and include source refs:

```ts
{
  id: 'p1_event.career_project_deadline',
  titleKey: 'catalog.event.careerProjectDeadline.title',
  summaryKey: 'catalog.event.careerProjectDeadline.summary',
  stage: 'adult',
  weight: 3,
  effects: { attributes: { smarts: 1, happiness: -1 } },
  sourceRefs: [{ sourceTitle: 'Careers', sourcePage: 'Careers' }],
}
```

Prefer compact, reusable event patterns covering school, work, relationships, family, assets, health, crime, prison, and elder life.

- [ ] **Step 4: Add locale keys**

Add English and Chinese strings for all new achievement and event title and summary keys. Keep event summaries one short sentence.

- [ ] **Step 5: Run full content validation**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/content/catalog/catalog.test.ts src/content/schema/catalogValidation.test.ts src/i18n/i18n.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 6: Commit achievements and events**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/catalog/achievements.ts src/content/catalog/events.ts src/i18n/locales
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: expand p1 achievements and events"
```

## Task 6: Final Content Gate

**Files:**
- Verify: `src/content/catalog/*`
- Verify: `src/i18n/locales/*`

- [ ] **Step 1: Run full automated verification**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: all tests pass and production build succeeds.

- [ ] **Step 2: Confirm generated data is not staged**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' status --short
```

Expected: no staged or unstaged files under `wiki_dump`, `data/wiki-index`, or `data/wiki-extracts`.

- [ ] **Step 3: Commit final content validation adjustments if needed**

If only catalog validation code or locale tests needed small corrections, commit them:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/content/schema src/content/catalog src/i18n
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "test: verify p1 content scale-up"
```

## Self-Review

- Scope is limited to runtime catalog scale-up, locale strings, and validation targets.
- Systems and UI are expected to exist before this work begins.
- The plan explicitly excludes raw Wiki and generated extract data from commits.
