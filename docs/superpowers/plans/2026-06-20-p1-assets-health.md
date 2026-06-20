# P1 Assets Health Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pure P1 asset and health systems for purchases, sales, licenses, disease onset, treatment, and yearly settlement.

**Architecture:** Assets and health are independent pure modules under `src/game/systems`. The engine calls yearly asset depreciation and health progression for v2 lives, while UI and store actions are handled by a sibling plan.

**Tech Stack:** TypeScript, Vitest, existing P1 catalogs, `LifeStateV2`, React/Vite app shell, Git.

---

## Current Context

Existing files to rely on:

- `src/game/lifeStateV2.ts` defines `assets`, `licenses`, `health`, and `stats`.
- `src/content/catalog/assets.ts` exports `assets`.
- `src/content/catalog/diseases.ts` exports `diseases`.
- `src/game/engine.ts` contains `ageUp` and `clampAttribute`.

Do not modify UI files in this plan. Do not commit generated `data/wiki-*` files or raw `wiki_dump` files.

## Files

- Create: `src/game/systems/assetSystem.ts`
- Create: `src/game/systems/assetSystem.test.ts`
- Create: `src/game/systems/healthSystem.ts`
- Create: `src/game/systems/healthSystem.test.ts`
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

## Task 1: Asset Purchases, Sales, Licenses, and Yearly Depreciation

**Files:**
- Create: `src/game/systems/assetSystem.ts`
- Create: `src/game/systems/assetSystem.test.ts`

- [ ] **Step 1: Write failing asset tests**

Create `src/game/systems/assetSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { buyAsset, obtainLicense, sellAsset, settleAssetYear } from './assetSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 31 }));
  return { ...life, character: { ...life.character, age: 25, money: 100000 } };
};

describe('assetSystem', () => {
  it('buys an affordable asset and deducts money', () => {
    const result = buyAsset(adultLife(), 'asset.used_compact');
    expect(result.assets[0]).toMatchObject({ catalogId: 'asset.used_compact', purchaseAge: 25 });
    expect(result.character.money).toBeLessThan(100000);
  });

  it('sells an owned asset and restores its value', () => {
    const owned = buyAsset(adultLife(), 'asset.used_compact');
    const assetId = owned.assets[0].id;
    const result = sellAsset(owned, assetId);
    expect(result.assets).toHaveLength(0);
    expect(result.character.money).toBe(owned.character.money + owned.assets[0].value);
  });

  it('obtains a driving license once', () => {
    const result = obtainLicense(adultLife(), 'driving');
    expect(result.licenses.driving).toBe(true);
    expect(obtainLicense(result, 'driving')).toBe(result);
  });

  it('depreciates assets during yearly settlement', () => {
    const owned = buyAsset(adultLife(), 'asset.used_compact');
    const result = settleAssetYear(owned);
    expect(result.assets[0].value).toBeLessThan(owned.assets[0].value);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/assetSystem.test.ts
```

Expected: FAIL because `assetSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal asset system**

Create `src/game/systems/assetSystem.ts`:

```ts
import { assets } from '../../content/catalog/assets';
import type { LicenseKind, LifeStateV2 } from '../lifeStateV2';

export function buyAsset(life: LifeStateV2, assetCatalogId: string): LifeStateV2 {
  const asset = assets.find((item) => item.id === assetCatalogId);
  if (asset === undefined || life.character.money < asset.price) {
    return life;
  }
  const owned = {
    id: `owned_${asset.id}_${life.character.age}_${life.assets.length}`,
    catalogId: asset.id,
    value: asset.price,
    purchaseAge: life.character.age,
  };
  return {
    ...life,
    character: { ...life.character, money: life.character.money - asset.price },
    assets: [...life.assets, owned],
  };
}

export function sellAsset(life: LifeStateV2, ownedAssetId: string): LifeStateV2 {
  const owned = life.assets.find((item) => item.id === ownedAssetId);
  if (owned === undefined) {
    return life;
  }
  return {
    ...life,
    character: { ...life.character, money: life.character.money + owned.value },
    assets: life.assets.filter((item) => item.id !== ownedAssetId),
  };
}

export function obtainLicense(life: LifeStateV2, license: LicenseKind): LifeStateV2 {
  if (life.licenses[license]) {
    return life;
  }
  return { ...life, licenses: { ...life.licenses, [license]: true } };
}

export function settleAssetYear(life: LifeStateV2): LifeStateV2 {
  return {
    ...life,
    assets: life.assets.map((item) => ({ ...item, value: Math.max(0, Math.round(item.value * 0.9)) })),
  };
}
```

- [ ] **Step 4: Run asset tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/assetSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit asset system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/assetSystem.ts src/game/systems/assetSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 asset system"
```

## Task 2: Disease Onset, Treatment, and Health Settlement

**Files:**
- Create: `src/game/systems/healthSystem.ts`
- Create: `src/game/systems/healthSystem.test.ts`

- [ ] **Step 1: Write failing health tests**

Create `src/game/systems/healthSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { contractDisease, settleHealthYear, treatDisease } from './healthSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 32 }));
  return { ...life, character: { ...life.character, age: 35, money: 10000 } };
};

describe('healthSystem', () => {
  it('adds a disease once and lowers health', () => {
    const result = contractDisease(adultLife(), 'disease.common_cold');
    expect(result.health.diseases).toContain('disease.common_cold');
    expect(result.character.attributes.health).toBeLessThan(adultLife().character.attributes.health);
    expect(contractDisease(result, 'disease.common_cold')).toBe(result);
  });

  it('treats an existing disease and records recovery', () => {
    const sick = contractDisease(adultLife(), 'disease.common_cold');
    const result = treatDisease(sick, 'disease.common_cold', 'doctor');
    expect(result.health.diseases).not.toContain('disease.common_cold');
    expect(result.health.treatmentHistory[0]).toMatchObject({ diseaseId: 'disease.common_cold', treatmentId: 'doctor', recovered: true });
    expect(result.stats.diseasesRecovered).toBe(1);
  });

  it('reduces health during yearly settlement when diseases are active', () => {
    const sick = contractDisease(adultLife(), 'disease.common_cold');
    const result = settleHealthYear(sick);
    expect(result.character.attributes.health).toBeLessThan(sick.character.attributes.health);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/healthSystem.test.ts
```

Expected: FAIL because `healthSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal health system**

Create `src/game/systems/healthSystem.ts`:

```ts
import { diseases } from '../../content/catalog/diseases';
import type { LifeStateV2 } from '../lifeStateV2';
import { clampAttribute } from '../engine';

export function contractDisease(life: LifeStateV2, diseaseId: string): LifeStateV2 {
  const disease = diseases.find((item) => item.id === diseaseId);
  if (disease === undefined || life.health.diseases.includes(diseaseId)) {
    return life;
  }
  return {
    ...life,
    character: {
      ...life.character,
      attributes: { ...life.character.attributes, health: clampAttribute(life.character.attributes.health + (disease.effects.attributes?.health ?? disease.yearlyHealthImpact)) },
    },
    health: { ...life.health, diseases: [...life.health.diseases, diseaseId] },
  };
}

export function treatDisease(life: LifeStateV2, diseaseId: string, treatmentId: string): LifeStateV2 {
  if (!life.health.diseases.includes(diseaseId)) {
    return life;
  }
  return {
    ...life,
    health: {
      diseases: life.health.diseases.filter((item) => item !== diseaseId),
      treatmentHistory: [...life.health.treatmentHistory, { diseaseId, treatmentId, age: life.character.age, recovered: true }],
    },
    stats: { ...life.stats, diseasesRecovered: life.stats.diseasesRecovered + 1 },
  };
}

export function settleHealthYear(life: LifeStateV2): LifeStateV2 {
  const yearlyImpact = life.health.diseases.length * 5;
  if (yearlyImpact === 0) {
    return life;
  }
  return {
    ...life,
    character: {
      ...life.character,
      attributes: { ...life.character.attributes, health: clampAttribute(life.character.attributes.health - yearlyImpact) },
    },
  };
}
```

- [ ] **Step 4: Run health tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/healthSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit health system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/healthSystem.ts src/game/systems/healthSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 health system"
```

## Task 3: Engine Hooks for Asset and Health Yearly Settlement

**Files:**
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

- [ ] **Step 1: Add failing engine test**

Add to `src/game/engine.test.ts`:

```ts
import { buyAsset } from './systems/assetSystem';
import { contractDisease } from './systems/healthSystem';

it('settles P1 assets and health during age up for v2 lives', () => {
  const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 62 }));
  const adult = { ...base, currentEvent: null, character: { ...base.character, age: 35, money: 100000 } };
  const withAsset = buyAsset(adult, 'asset.used_compact');
  const sick = contractDisease(withAsset, 'disease.common_cold');
  const result = ageUp(sick, 'assets-health-engine');
  expect(result.assets[0].value).toBeLessThan(sick.assets[0].value);
  expect(result.character.attributes.health).toBeLessThan(sick.character.attributes.health);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: FAIL until `ageUp` calls asset and health settlement.

- [ ] **Step 3: Wire yearly settlement**

In `src/game/engine.ts`, import:

```ts
import { settleAssetYear } from './systems/assetSystem';
import { settleHealthYear } from './systems/healthSystem';
```

In the v2 settlement branch of `ageUp`, compose these hooks after career settlement and before death checking:

```ts
const settledLife =
  agedLife.version === 2
    ? settleHealthYear(settleAssetYear(agedLife as LifeStateV2))
    : agedLife;
```

If previous subsystem hooks already exist, preserve them and use this order: education, career, assets, health, relationships, family.

- [ ] **Step 4: Run tests and build**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts src/game/systems/assetSystem.test.ts src/game/systems/healthSystem.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 5: Commit engine hooks**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/engine.ts src/game/engine.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: settle p1 assets and health years"
```

## Self-Review

- Scope is limited to assets, licenses, diseases, treatment, and their yearly settlement hooks.
- Crime, prison, achievements, store actions, UI panels, and content scale-up are handled by sibling plans.
- The plan uses reviewed seed catalogs and avoids committing raw Wiki or generated data.
