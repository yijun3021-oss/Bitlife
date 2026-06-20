# P1 Crime Prison Achievements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pure P1 systems for crime attempts, prison sentencing and release, and achievement unlocks.

**Architecture:** Crime, prison, and achievements are separate pure modules in `src/game/systems`. Crime actions update `criminalRecord` and may enter prison; prison settlement decrements remaining years; achievement checks derive unlocks from `LifeStateV2` stats and containers.

**Tech Stack:** TypeScript, Vitest, existing P1 catalogs, `LifeStateV2`, React/Vite app shell, Git.

---

## Current Context

Existing files to rely on:

- `src/game/lifeStateV2.ts` defines `criminalRecord`, `prison`, `achievements`, and `stats`.
- `src/content/catalog/crimes.ts` exports `crimes`.
- `src/content/catalog/prison.ts` exports `prisonActivities`.
- `src/content/catalog/achievements.ts` exports `achievements`.
- `src/game/engine.ts` contains `ageUp` and `clampAttribute`.

Do not modify UI files in this plan. Do not commit generated `data/wiki-*` files or raw `wiki_dump` files.

## Files

- Create: `src/game/systems/crimeSystem.ts`
- Create: `src/game/systems/crimeSystem.test.ts`
- Create: `src/game/systems/prisonSystem.ts`
- Create: `src/game/systems/prisonSystem.test.ts`
- Create: `src/game/systems/achievementSystem.ts`
- Create: `src/game/systems/achievementSystem.test.ts`
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

## Task 1: Crime Attempts and Sentencing

**Files:**
- Create: `src/game/systems/crimeSystem.ts`
- Create: `src/game/systems/crimeSystem.test.ts`

- [ ] **Step 1: Write failing crime tests**

Create `src/game/systems/crimeSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { attemptCrime } from './crimeSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 41 }));
  return { ...life, character: { ...life.character, age: 25 } };
};

describe('crimeSystem', () => {
  it('records a successful low risk crime and increments crime stats', () => {
    const result = attemptCrime(adultLife(), 'crime.shoplifting', 0);
    expect(result.stats.crimesSucceeded).toBe(1);
    expect(result.criminalRecord.arrests).toEqual([]);
  });

  it('records arrest and conviction when a crime fails', () => {
    const result = attemptCrime(adultLife(), 'crime.bank_robbery', 0.99);
    expect(result.criminalRecord.arrests).toHaveLength(1);
    expect(result.criminalRecord.convictions).toHaveLength(1);
    expect(result.prison.incarcerated).toBe(true);
    expect(result.prison.remainingYears).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/crimeSystem.test.ts
```

Expected: FAIL because `crimeSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal crime system**

Create `src/game/systems/crimeSystem.ts`:

```ts
import { crimes } from '../../content/catalog/crimes';
import type { LifeStateV2 } from '../lifeStateV2';

export function attemptCrime(life: LifeStateV2, crimeId: string, roll: number): LifeStateV2 {
  const crime = crimes.find((item) => item.id === crimeId);
  if (crime === undefined || life.prison.incarcerated) {
    return life;
  }
  if (roll < crime.successChance) {
    return { ...life, stats: { ...life.stats, crimesSucceeded: life.stats.crimesSucceeded + 1 } };
  }

  const arrest = { id: `arrest_${crime.id}_${life.character.age}_${life.criminalRecord.arrests.length}`, crimeId: crime.id, age: life.character.age };
  const conviction = {
    id: `conviction_${crime.id}_${life.character.age}_${life.criminalRecord.convictions.length}`,
    crimeId: crime.id,
    age: life.character.age,
    sentenceYears: crime.sentenceYears,
  };
  return {
    ...life,
    criminalRecord: {
      arrests: [...life.criminalRecord.arrests, arrest],
      convictions: [...life.criminalRecord.convictions, conviction],
    },
    prison: {
      incarcerated: true,
      remainingYears: crime.sentenceYears,
      behavior: 50,
      appealAvailable: true,
      paroleEligible: crime.sentenceYears > 1,
    },
  };
}
```

- [ ] **Step 4: Run crime tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/crimeSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit crime system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/crimeSystem.ts src/game/systems/crimeSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 crime system"
```

## Task 2: Prison Actions and Yearly Settlement

**Files:**
- Create: `src/game/systems/prisonSystem.ts`
- Create: `src/game/systems/prisonSystem.test.ts`

- [ ] **Step 1: Write failing prison tests**

Create `src/game/systems/prisonSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { attemptCrime } from './crimeSystem';
import { attemptAppeal, settlePrisonYear } from './prisonSystem';

const incarceratedLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 42 }));
  const adult = { ...life, character: { ...life.character, age: 25 } };
  return attemptCrime(adult, 'crime.bank_robbery', 0.99);
};

describe('prisonSystem', () => {
  it('reduces remaining sentence during yearly settlement', () => {
    const prisoner = incarceratedLife();
    const result = settlePrisonYear(prisoner);
    expect(result.prison.remainingYears).toBe(prisoner.prison.remainingYears - 1);
    expect(result.stats.prisonYears).toBe(1);
  });

  it('releases the character when sentence reaches zero', () => {
    const prisoner = { ...incarceratedLife(), prison: { ...incarceratedLife().prison, remainingYears: 1 } };
    const result = settlePrisonYear(prisoner);
    expect(result.prison.incarcerated).toBe(false);
    expect(result.prison.remainingYears).toBe(0);
  });

  it('allows a successful appeal once', () => {
    const result = attemptAppeal(incarceratedLife(), 0.99);
    expect(result.prison.incarcerated).toBe(false);
    expect(result.prison.appealAvailable).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/prisonSystem.test.ts
```

Expected: FAIL because `prisonSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal prison system**

Create `src/game/systems/prisonSystem.ts`:

```ts
import type { LifeStateV2 } from '../lifeStateV2';

export function settlePrisonYear(life: LifeStateV2): LifeStateV2 {
  if (!life.prison.incarcerated) {
    return life;
  }
  const remainingYears = Math.max(0, life.prison.remainingYears - 1);
  return {
    ...life,
    prison: {
      ...life.prison,
      incarcerated: remainingYears > 0,
      remainingYears,
      paroleEligible: remainingYears > 1,
      appealAvailable: remainingYears > 0 && life.prison.appealAvailable,
    },
    stats: { ...life.stats, prisonYears: life.stats.prisonYears + 1 },
  };
}

export function attemptAppeal(life: LifeStateV2, roll: number): LifeStateV2 {
  if (!life.prison.incarcerated || !life.prison.appealAvailable) {
    return life;
  }
  if (roll < 0.5) {
    return { ...life, prison: { ...life.prison, appealAvailable: false } };
  }
  return {
    ...life,
    prison: { incarcerated: false, remainingYears: 0, behavior: life.prison.behavior, appealAvailable: false, paroleEligible: false },
  };
}
```

- [ ] **Step 4: Run prison tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/crimeSystem.test.ts src/game/systems/prisonSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit prison system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/prisonSystem.ts src/game/systems/prisonSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 prison system"
```

## Task 3: Achievement Unlocks

**Files:**
- Create: `src/game/systems/achievementSystem.ts`
- Create: `src/game/systems/achievementSystem.test.ts`

- [ ] **Step 1: Write failing achievement tests**

Create `src/game/systems/achievementSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { unlockAchievements } from './achievementSystem';

const adultLife = () => migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 43 }));

describe('achievementSystem', () => {
  it('unlocks first job achievement from career state', () => {
    const life = { ...adultLife(), career: { currentJobId: 'career.cashier', performance: 50, yearsInRole: 1, retired: false } };
    const result = unlockAchievements(life);
    expect(result.achievements.unlocked).toContain('achievement.steady_career');
  });

  it('does not duplicate unlocked achievements', () => {
    const life = { ...adultLife(), achievements: { unlocked: ['achievement.steady_career'] }, career: { currentJobId: 'career.cashier', performance: 50, yearsInRole: 10, retired: false } };
    const result = unlockAchievements(life);
    expect(result.achievements.unlocked.filter((id) => id === 'achievement.steady_career')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/achievementSystem.test.ts
```

Expected: FAIL because `achievementSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal achievement system**

Create `src/game/systems/achievementSystem.ts`:

```ts
import { achievements } from '../../content/catalog/achievements';
import type { LifeStateV2 } from '../lifeStateV2';

function isUnlockedByState(life: LifeStateV2, achievementId: string): boolean {
  if (achievementId === 'achievement.steady_career') {
    return life.career.yearsInRole >= 10;
  }
  if (achievementId === 'achievement.first_crime') {
    return life.stats.crimesSucceeded > 0 || life.criminalRecord.arrests.length > 0;
  }
  if (achievementId === 'achievement.second_chance') {
    return life.stats.prisonYears > 0;
  }
  return false;
}

export function unlockAchievements(life: LifeStateV2): LifeStateV2 {
  const unlocked = new Set(life.achievements.unlocked);
  for (const achievement of achievements) {
    if (isUnlockedByState(life, achievement.id)) {
      unlocked.add(achievement.id);
    }
  }
  return { ...life, achievements: { unlocked: [...unlocked] } };
}
```

- [ ] **Step 4: Run achievement tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/achievementSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit achievement system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/achievementSystem.ts src/game/systems/achievementSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 achievement system"
```

## Task 4: Engine Hooks for Prison Year and Achievement Unlocks

**Files:**
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

- [ ] **Step 1: Add failing engine test**

Add to `src/game/engine.test.ts`:

```ts
import { attemptCrime } from './systems/crimeSystem';

it('settles prison and unlocks achievements during age up for v2 lives', () => {
  const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 72 }));
  const adult = { ...base, currentEvent: null, character: { ...base.character, age: 25 } };
  const prisoner = attemptCrime(adult, 'crime.bank_robbery', 0.99);
  const result = ageUp(prisoner, 'crime-prison-achievement-engine');
  expect(result.stats.prisonYears).toBe(1);
  expect(result.achievements.unlocked).toContain('achievement.second_chance');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: FAIL until `ageUp` calls prison settlement and achievement unlocking.

- [ ] **Step 3: Wire yearly settlement and unlocks**

In `src/game/engine.ts`, import:

```ts
import { unlockAchievements } from './systems/achievementSystem';
import { settlePrisonYear } from './systems/prisonSystem';
```

In the v2 settlement branch of `ageUp`, compose these hooks after health and before event selection:

```ts
const settledLife =
  agedLife.version === 2
    ? unlockAchievements(settlePrisonYear(agedLife as LifeStateV2))
    : agedLife;
```

If previous subsystem hooks already exist, preserve them and use this order: education, career, assets, health, prison, relationships, family, achievements.

- [ ] **Step 4: Run tests and build**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts src/game/systems/crimeSystem.test.ts src/game/systems/prisonSystem.test.ts src/game/systems/achievementSystem.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 5: Commit engine hooks**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/engine.ts src/game/engine.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: settle p1 prison and achievements"
```

## Self-Review

- Scope is limited to crime actions, prison actions, prison yearly settlement, and achievement unlocks.
- Store actions, UI panels, and content scale-up are handled by sibling plans.
- The plan references seed catalogs and avoids committing raw Wiki or generated data.
