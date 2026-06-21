# P1 UI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire existing P1 game systems into store actions and mobile-first UI panels after system modules exist.

**Architecture:** Zustand store actions call pure `src/game/systems/*` functions. React components receive state and callbacks from the store, use existing localization helpers, and avoid duplicating game-rule checks that belong in system modules.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Vitest, Testing Library, existing CSS, Git.

---

## Current Context

Existing files to rely on:

- `src/store/lifeStore.ts` owns persistence and existing actions.
- `src/App.tsx` wires the top-level app.
- `src/ui/SchoolWorkPanel.tsx`, `src/ui/RelationshipsPanel.tsx`, `src/ui/ActivityPanel.tsx`, `src/ui/Dashboard.tsx`, and `src/ui/DeathSummary.tsx` already exist.
- The system plans should have created `src/game/systems/educationSystem.ts`, `careerSystem.ts`, `relationshipSystem.ts`, `familySystem.ts`, `assetSystem.ts`, `healthSystem.ts`, `crimeSystem.ts`, `prisonSystem.ts`, and `achievementSystem.ts`.

This plan starts only after those systems compile. Do not modify system rule logic here. Do not commit generated `data/wiki-*` files or raw `wiki_dump` files.

## Files

- Modify: `src/store/lifeStore.ts`
- Create: `src/store/lifeStore.p1-migration.test.ts`
- Create: `src/store/lifeStore.p1-actions.test.ts`
- Modify: `src/App.tsx`
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
- Create: `src/ui/App.p1.test.tsx`
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/styles.css`

## Task 1: Store Migration and LifeStateV2 Typing

**Files:**
- Modify: `src/store/lifeStore.ts`
- Create: `src/store/lifeStore.p1-migration.test.ts`

- [ ] **Step 1: Write failing store migration tests**

Create `src/store/lifeStore.p1-migration.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createNewLife } from '../game/engine';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { SAVE_KEY, useLifeStore } from './lifeStore';

function savedV1Json() {
  const life = createNewLife({ name: 'Saved Person', gender: 'female', countryId: 'us', locale: 'en-US', seed: 111 });
  return JSON.stringify({ version: 1, locale: 'en-US', life });
}

describe('p1 store migration', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates new active lives as LifeStateV2', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'us' });
    const life: LifeStateV2 | null = useLifeStore.getState().life;
    expect(life?.version).toBe(2);
    expect(life?.career.currentJobId).toBeNull();
  });

  it('migrates loaded saved lives before continueLife exposes them as active', () => {
    localStorage.setItem(SAVE_KEY, savedV1Json());
    useLifeStore.getState().loadLife();
    expect(useLifeStore.getState().savedLife?.version).toBe(2);
    useLifeStore.getState().continueLife();
    const life: LifeStateV2 | null = useLifeStore.getState().life;
    expect(life?.version).toBe(2);
    expect(life?.assets).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/store/lifeStore.p1-migration.test.ts
```

Expected: FAIL because the store is still typed around v1 `LifeState` and does not normalize active or saved lives through `migrateLifeState`.

- [ ] **Step 3: Update store state types to LifeStateV2**

Modify `src/store/lifeStore.ts` imports:

```ts
import type { LifeStateV2 } from '../game/lifeStateV2';
import { migrateLifeState } from '../game/migrations';
import type { Gender, LifeState, Locale, RelationshipActionId } from '../game/types';
```

Update store and save types so active state is v2 after normalization:

```ts
interface SaveRecord {
  version: 1;
  locale: Locale;
  life: LifeState | LifeStateV2 | null;
}

interface LifeStoreState {
  locale: Locale;
  life: LifeStateV2 | null;
  savedLife: LifeStateV2 | null;
  activeTab: ActiveTab;
}
```

Keep `LifeState` in `SaveRecord` only as accepted legacy input from localStorage.

- [ ] **Step 4: Normalize create, load, continue, and save paths**

In `src/store/lifeStore.ts`, use `migrateLifeState` in every path that creates, loads, activates, or saves a life:

```ts
createLife: (input) => {
  const life = migrateLifeState(createNewLife({
    ...input,
    locale: get().locale,
    seed: Date.now() % 100000,
  }));
  set({ life, savedLife: null, activeTab: 'life' });
  writeSave(get().locale, life);
},
```

Normalize loaded records:

```ts
return {
  version: 1,
  locale: save.locale,
  life: save.life === null ? null : normalizeLife(save.life),
};
```

Normalize before activating a saved life:

```ts
const life = migrateLifeState(savedLife);
set({ life, savedLife: null, activeTab: 'life' });
writeSave(get().locale, life);
```

Update helper signatures:

```ts
function writeSave(locale: Locale, life: LifeStateV2 | null): void
function updateLife(
  currentLife: LifeStateV2,
  life: LifeStateV2,
  locale: Locale,
  set: (partial: Partial<LifeStoreState>) => void,
  extraState: Partial<Pick<LifeStoreState, 'activeTab'>> = {},
): void
function normalizeLife(life: LifeState | LifeStateV2): LifeStateV2
```

Implement `writeSave` so the saved payload is normalized immediately before serialization:

```ts
function writeSave(locale: Locale, life: LifeStateV2 | null): void {
  const normalizedLife = life === null ? null : migrateLifeState(life);
  const save: SaveRecord = { version: 1, locale, life: normalizedLife };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
```

Keep the existing `try/catch` around localStorage writes. Implement `normalizeLife` so it preserves the existing `usedActivitiesThisAge` repair and then returns `migrateLifeState(repairedLife)`.

- [ ] **Step 5: Accept v1 and v2 saves during validation**

Update `isSavedLife` so it accepts `version === 1` legacy lives and `version === 2` migrated lives. The v2 branch must verify the required P1 containers before returning true:

```ts
const version = (value as { version?: unknown }).version;
if (version !== 1 && version !== 2) {
  return false;
}
```

For v2 saves, check at least `education`, `career`, `family`, `assets`, `licenses`, `health`, `criminalRecord`, `prison`, `achievements`, and `stats` are plain objects or arrays with the expected top-level shapes. Keep detailed nested validation modest and deterministic so older v1 saves still migrate.

- [ ] **Step 6: Run migration tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/store/lifeStore.test.ts src/store/lifeStore.p1-migration.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit store migration**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/store/lifeStore.ts src/store/lifeStore.p1-migration.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: migrate store lives to p1 state"
```

## Task 2: Store Actions for Existing P1 Systems

**Files:**
- Modify: `src/store/lifeStore.ts`
- Create: `src/store/lifeStore.p1-actions.test.ts`

- [ ] **Step 1: Write failing store action tests**

Create `src/store/lifeStore.p1-actions.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('p1 store actions', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
    useLifeStore.getState().setLocale('en-US');
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'us' });
    useLifeStore.setState((state) => ({
      life: state.life === null ? null : { ...state.life, character: { ...state.life.character, age: 25, money: 100000, attributes: { ...state.life.character.attributes, smarts: 80 } } },
    }));
  });

  it('applies education and career actions through the store', () => {
    useLifeStore.getState().enrollInProgram('education.university');
    expect(useLifeStore.getState().life?.education.majorId).toBe('education.university');
    useLifeStore.setState((state) => ({
      life: state.life === null ? null : { ...state.life, education: { ...state.life.education, level: 'university', graduated: true } },
    }));
    useLifeStore.getState().applyForCareer('career.software_analyst');
    expect(useLifeStore.getState().life?.career.currentJobId).toBe('career.software_analyst');
  });

  it('applies assets, health, crime, and prison actions through the store', () => {
    useLifeStore.getState().buyAsset('asset.used_compact');
    expect(useLifeStore.getState().life?.assets.length).toBe(1);
    useLifeStore.getState().contractDisease('disease.common_cold');
    expect(useLifeStore.getState().life?.health.diseases).toContain('disease.common_cold');
    useLifeStore.getState().attemptCrime('crime.bank_robbery', 0.99);
    expect(useLifeStore.getState().life?.prison.incarcerated).toBe(true);
    useLifeStore.getState().attemptAppeal(0.99);
    expect(useLifeStore.getState().life?.prison.incarcerated).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/store/lifeStore.p1-actions.test.ts
```

Expected: FAIL because P1 store actions are not defined. The migration test from Task 1 must pass before continuing so these actions receive `LifeStateV2`, not v1 `LifeState`.

- [ ] **Step 3: Add typed store actions**

Modify `src/store/lifeStore.ts` to import system functions:

```ts
import { buyAsset, obtainLicense, sellAsset } from '../game/systems/assetSystem';
import { applyForCareer } from '../game/systems/careerSystem';
import { attemptCrime } from '../game/systems/crimeSystem';
import { enrollInProgram } from '../game/systems/educationSystem';
import { adoptChild, divorceSpouse, marryPartner } from '../game/systems/familySystem';
import { contractDisease, treatDisease } from '../game/systems/healthSystem';
import { attemptAppeal } from '../game/systems/prisonSystem';
import { addRelationship, askOnDate } from '../game/systems/relationshipSystem';
```

Add actions to the store interface and implementation:

```ts
enrollInProgram: (programId: string) => void;
applyForCareer: (careerId: string) => void;
addRelationship: (input: { id: string; name: string; type: RelationshipKind; closeness: number }) => void;
askOnDate: (relationshipId: string) => void;
marryPartner: (relationshipId: string) => void;
divorceSpouse: () => void;
adoptChild: (child: { id: string; name: string }) => void;
buyAsset: (assetCatalogId: string) => void;
sellAsset: (ownedAssetId: string) => void;
obtainLicense: (license: LicenseKind) => void;
contractDisease: (diseaseId: string) => void;
treatDisease: (diseaseId: string, treatmentId: string) => void;
attemptCrime: (crimeId: string, roll?: number) => void;
attemptAppeal: (roll?: number) => void;
```

Each action should follow the existing store mutation pattern:

```ts
enrollInProgram: (programId) => set((state) => state.life === null ? state : { life: enrollInProgram(state.life, programId) }),
```

Because `LifeStoreState.life` is now `LifeStateV2 | null`, each P1 action passes a `LifeStateV2` into its system function without casts.

Use `Math.random()` only as the default roll in store action wrappers; keep deterministic rolls available for tests.

- [ ] **Step 4: Run store tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/store/lifeStore.test.ts src/store/lifeStore.p1-migration.test.ts src/store/lifeStore.p1-actions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit store actions**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/store/lifeStore.ts src/store/lifeStore.p1-actions.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 store actions"
```

## Task 3: P1 Panels and App Wiring

**Files:**
- Modify: `src/App.tsx`
- Create: `src/ui/ProfilePanel.tsx`
- Create: `src/ui/panels/AssetsPanel.tsx`
- Create: `src/ui/panels/HealthPanel.tsx`
- Create: `src/ui/panels/CrimePanel.tsx`
- Create: `src/ui/panels/PrisonPanel.tsx`
- Create: `src/ui/panels/AchievementsPanel.tsx`
- Modify: `src/ui/SchoolWorkPanel.tsx`
- Modify: `src/ui/RelationshipsPanel.tsx`
- Modify: `src/ui/ActivityPanel.tsx`
- Modify: `src/ui/Dashboard.tsx`
- Modify: `src/styles.css`
- Create: `src/ui/App.p1.test.tsx`

- [ ] **Step 1: Write failing UI smoke test**

Create `src/ui/App.p1.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('P1 app integration', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
    useLifeStore.getState().setLocale('en-US');
  });

  it('shows P1 panels after life creation', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: /create life/i }));
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /assets/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /health/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /crime/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /achievements/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/ui/App.p1.test.tsx
```

Expected: FAIL because P1 panels are not wired.

- [ ] **Step 3: Create panel components**

Create each panel as a prop-driven component:

```tsx
export function AssetsPanel({ life, onBuyAsset, onSellAsset }: AssetsPanelProps) {
  return (
    <section className="panel" aria-labelledby="assets-heading">
      <h2 id="assets-heading">Assets</h2>
      {life.assets.map((asset) => (
        <button key={asset.id} type="button" onClick={() => onSellAsset(asset.id)}>
          Sell {asset.catalogId}
        </button>
      ))}
      <button type="button" onClick={() => onBuyAsset('asset.used_compact')}>Buy used compact</button>
    </section>
  );
}
```

Use these files and responsibilities:

- `src/ui/ProfilePanel.tsx`: show age, money, education, career, spouse, children count, licenses.
- `src/ui/panels/AssetsPanel.tsx`: render `life.assets`, available catalog assets, buy and sell controls.
- `src/ui/panels/HealthPanel.tsx`: render active diseases, treatment buttons, health stat.
- `src/ui/panels/CrimePanel.tsx`: render available crimes and arrest/conviction counts.
- `src/ui/panels/PrisonPanel.tsx`: render only when `life.prison.incarcerated` is true, with appeal control.
- `src/ui/panels/AchievementsPanel.tsx`: render unlocked achievement ids with localized titles when keys exist.

Keep visible labels localized by adding keys in Task 4.

- [ ] **Step 4: Wire panels into `src/App.tsx`**

Import panels and store actions, then render them after life creation in the existing app layout:

```tsx
<ProfilePanel life={life} />
<SchoolWorkPanel life={life} onEnroll={enrollInProgram} onApplyForCareer={applyForCareer} />
<RelationshipsPanel life={life} onAskOnDate={askOnDate} onMarry={marryPartner} onDivorce={divorceSpouse} onAdopt={adoptChild} />
<AssetsPanel life={life} onBuyAsset={buyAsset} onSellAsset={sellAsset} />
<HealthPanel life={life} onTreatDisease={treatDisease} />
<CrimePanel life={life} onAttemptCrime={attemptCrime} />
<PrisonPanel life={life} onAttemptAppeal={attemptAppeal} />
<AchievementsPanel life={life} />
```

Preserve existing tabs or panels if they already provide the same navigation pattern.

- [ ] **Step 5: Run UI tests and build**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/ui/App.test.tsx src/ui/App.p1.test.tsx src/store/lifeStore.p1-migration.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 6: Commit panel wiring**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/App.tsx src/ui src/styles.css
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: wire p1 mobile panels"
```

## Task 4: Locale Labels for P1 UI

**Files:**
- Modify: `src/i18n/locales/en-US.ts`
- Modify: `src/i18n/locales/zh-CN.ts`
- Test: `src/i18n/i18n.test.ts`

- [ ] **Step 1: Write failing locale assertions**

Add to `src/i18n/i18n.test.ts`:

```ts
it('contains P1 panel labels in both locales', () => {
  for (const key of ['ui.profile', 'ui.assets', 'ui.health', 'ui.crime', 'ui.prison', 'ui.achievements']) {
    expect(enUS[key]).toBeTypeOf('string');
    expect(zhCN[key]).toBeTypeOf('string');
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/i18n/i18n.test.ts
```

Expected: FAIL until locale keys are added.

- [ ] **Step 3: Add concrete locale keys**

Add these English keys to `src/i18n/locales/en-US.ts`:

```ts
'ui.profile': 'Profile',
'ui.assets': 'Assets',
'ui.health': 'Health',
'ui.crime': 'Crime',
'ui.prison': 'Prison',
'ui.achievements': 'Achievements',
```

Add matching Chinese keys to `src/i18n/locales/zh-CN.ts` using original app phrasing.

- [ ] **Step 4: Run full UI and locale verification**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/i18n/i18n.test.ts src/ui/App.test.tsx src/ui/App.p1.test.tsx src/store/lifeStore.p1-migration.test.ts src/store/lifeStore.p1-actions.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 5: Commit locale labels**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/i18n/locales src/i18n/i18n.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 ui labels"
```

## Self-Review

- Scope starts after system modules exist and avoids changing pure game rules.
- Store migration, store actions, panels, styles, and locale labels are covered by separate commits.
- This plan does not require generated Wiki data and does not commit raw content dumps.
