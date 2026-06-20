# P1 Education Career Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pure P1 education and career systems, then wire only their yearly settlement into the engine.

**Architecture:** Keep game rules in `src/game/systems` with pure functions that accept and return `LifeStateV2`. The engine remains an orchestrator: it delegates education and career settlement during `ageUp`, while UI and store work stay outside this plan.

**Tech Stack:** TypeScript, Vitest, React/Vite app shell, existing catalog files in `src/content/catalog`, Git.

---

## Current Context

Existing files to rely on:

- `src/game/lifeStateV2.ts` defines `LifeStateV2`, `EducationLevel`, and v2 containers.
- `src/game/migrations.ts` upgrades v1 saves to v2.
- `src/content/catalog/education.ts` exports `educationPrograms`.
- `src/content/catalog/careers.ts` exports `careers`.
- `src/game/engine.ts` currently contains v1 school and job logic.

Do not commit generated `data/wiki-*` files or raw `wiki_dump` files. Node/npm may need `C:\Program Files\nodejs` on PATH.

## Files

- Create: `src/game/systems/educationSystem.ts`
- Create: `src/game/systems/educationSystem.test.ts`
- Create: `src/game/systems/careerSystem.ts`
- Create: `src/game/systems/careerSystem.test.ts`
- Modify: `src/game/lifeStateV2.ts`
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

## Task 0: Align Education Level Type

**Files:**
- Modify: `src/game/lifeStateV2.ts`
- Test: `src/game/migrations.test.ts`

- [ ] **Step 1: Write the failing type-level usage test**

Add this assertion to `src/game/migrations.test.ts`:

```ts
import type { EducationLevel } from './lifeStateV2';

it('allows community college as a P1 education level', () => {
  const level: EducationLevel = 'community_college';
  expect(level).toBe('community_college');
});
```

- [ ] **Step 2: Run test to verify it fails at compile time**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/migrations.test.ts
```

Expected: FAIL because `EducationLevel` does not include `community_college`.

- [ ] **Step 3: Update the v2 education type**

Modify `src/game/lifeStateV2.ts`:

```ts
export type EducationLevel = LifeState['school']['stage'] | 'community_college' | 'university';
```

- [ ] **Step 4: Run migration tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/migrations.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit type alignment**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/lifeStateV2.ts src/game/migrations.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: align p1 education level type"
```

## Task 1: Education Enrollment and Yearly Settlement

**Files:**
- Create: `src/game/systems/educationSystem.ts`
- Create: `src/game/systems/educationSystem.test.ts`

- [ ] **Step 1: Write the failing education system tests**

Create `src/game/systems/educationSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { enrollInProgram, settleEducationYear } from './educationSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 7 }));
  return { ...life, character: { ...life.character, age: 18, money: 20000, attributes: { ...life.character.attributes, smarts: 70 } } };
};

describe('educationSystem', () => {
  it('enrolls an eligible adult in university and charges tuition', () => {
    const result = enrollInProgram(adultLife(), 'education.university');
    expect(result.education.level).toBe('university');
    expect(result.education.majorId).toBe('education.university');
    expect(result.education.graduated).toBe(false);
    expect(result.character.money).toBe(4000);
  });

  it('rejects programs when smarts or money requirements are not met', () => {
    const life = { ...adultLife(), character: { ...adultLife().character, money: 1000, attributes: { ...adultLife().character.attributes, smarts: 20 } } };
    expect(enrollInProgram(life, 'education.university')).toBe(life);
  });

  it('settles school grade and stress each year without graduating early', () => {
    const enrolled = enrollInProgram(adultLife(), 'education.community_college');
    const result = settleEducationYear(enrolled);
    expect(result.education.grade).toBe(enrolled.education.grade + 1);
    expect(result.education.stress).toBeGreaterThanOrEqual(enrolled.education.stress);
    expect(result.education.graduated).toBe(false);
  });

  it('marks a program graduated after its duration', () => {
    const enrolled = enrollInProgram(adultLife(), 'education.community_college');
    const yearOne = settleEducationYear(enrolled);
    const yearTwo = settleEducationYear(yearOne);
    expect(yearTwo.education.graduated).toBe(true);
    expect(yearTwo.education.level).toBe('community_college');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/educationSystem.test.ts
```

Expected: FAIL because `src/game/systems/educationSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal education system**

Create `src/game/systems/educationSystem.ts`:

```ts
import { educationPrograms } from '../../content/catalog/education';
import type { LifeStateV2 } from '../lifeStateV2';
import { clampAttribute } from '../engine';

export function enrollInProgram(life: LifeStateV2, programId: string): LifeStateV2 {
  const program = educationPrograms.find((item) => item.id === programId);
  if (program === undefined || life.character.age < program.minAge) {
    return life;
  }
  if (life.character.attributes.smarts < program.smartsMin || life.character.money < program.tuition) {
    return life;
  }
  if (life.education.majorId !== null && !life.education.graduated) {
    return life;
  }

  return {
    ...life,
    character: { ...life.character, money: life.character.money - program.tuition },
    education: {
      level: program.level === 'secondary' ? life.education.level : program.level,
      majorId: program.id,
      grade: 0,
      stress: clampAttribute(life.education.stress + 8),
      graduated: false,
    },
  };
}

export function settleEducationYear(life: LifeStateV2): LifeStateV2 {
  if (life.education.majorId === null || life.education.graduated) {
    return life;
  }
  const program = educationPrograms.find((item) => item.id === life.education.majorId);
  if (program === undefined) {
    return life;
  }

  const nextGrade = life.education.grade + 1;
  const graduated = nextGrade >= program.durationYears;
  return {
    ...life,
    education: {
      ...life.education,
      grade: nextGrade,
      stress: graduated ? clampAttribute(life.education.stress - 15) : clampAttribute(life.education.stress + 4),
      graduated,
    },
  };
}
```

- [ ] **Step 4: Run education tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/educationSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit education system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/educationSystem.ts src/game/systems/educationSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 education system"
```

## Task 2: Career Hiring, Promotion, and Yearly Income

**Files:**
- Create: `src/game/systems/careerSystem.ts`
- Create: `src/game/systems/careerSystem.test.ts`

- [ ] **Step 1: Write the failing career system tests**

Create `src/game/systems/careerSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { applyForCareer, settleCareerYear } from './careerSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 9 }));
  return { ...life, character: { ...life.character, age: 22, attributes: { ...life.character.attributes, smarts: 75 } }, education: { ...life.education, level: 'university' as const, graduated: true } };
};

describe('careerSystem', () => {
  it('accepts a qualified career application', () => {
    const result = applyForCareer(adultLife(), 'career.software_analyst');
    expect(result.career.currentJobId).toBe('career.software_analyst');
    expect(result.career.performance).toBe(50);
    expect(result.career.yearsInRole).toBe(0);
  });

  it('rejects applications when education is insufficient', () => {
    const life = { ...adultLife(), education: { ...adultLife().education, level: 'none' as const, graduated: false } };
    expect(applyForCareer(life, 'career.software_analyst')).toBe(life);
  });

  it('pays salary and advances years in role during yearly settlement', () => {
    const employed = applyForCareer(adultLife(), 'career.cashier');
    const result = settleCareerYear(employed);
    expect(result.character.money).toBe(employed.character.money + 18000);
    expect(result.career.yearsInRole).toBe(1);
    expect(result.stats.totalIncome).toBe(18000);
    expect(result.stats.workYears).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/careerSystem.test.ts
```

Expected: FAIL because `src/game/systems/careerSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal career system**

Create `src/game/systems/careerSystem.ts`:

```ts
import { careers, type CareerCatalogItem } from '../../content/catalog/careers';
import type { LifeStateV2 } from '../lifeStateV2';
import { clampAttribute } from '../engine';

function educationMeetsRequirement(life: LifeStateV2, career: CareerCatalogItem): boolean {
  if (career.educationLevel === 'none') {
    return true;
  }
  return life.education.level === career.educationLevel && life.education.graduated;
}

export function applyForCareer(life: LifeStateV2, careerId: string): LifeStateV2 {
  const career = careers.find((item) => item.id === careerId);
  if (career === undefined || life.character.age < 18 || life.career.currentJobId !== null) {
    return life;
  }
  if (life.character.attributes.smarts < career.smartsMin || !educationMeetsRequirement(life, career)) {
    return life;
  }

  return {
    ...life,
    career: { currentJobId: career.id, performance: 50, yearsInRole: 0, retired: false },
  };
}

export function settleCareerYear(life: LifeStateV2): LifeStateV2 {
  if (life.career.currentJobId === null || life.career.retired) {
    return life;
  }
  const career = careers.find((item) => item.id === life.career.currentJobId);
  if (career === undefined) {
    return life;
  }
  const salary = career.salary;
  return {
    ...life,
    character: { ...life.character, money: life.character.money + salary },
    career: {
      ...life.career,
      yearsInRole: life.career.yearsInRole + 1,
      performance: clampAttribute(life.career.performance + (life.character.attributes.smarts >= career.smartsMin + 10 ? 3 : 1)),
    },
    stats: {
      ...life.stats,
      totalIncome: life.stats.totalIncome + salary,
      workYears: life.stats.workYears + 1,
    },
  };
}
```

- [ ] **Step 4: Run career tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/careerSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit career system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/careerSystem.ts src/game/systems/careerSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 career system"
```

## Task 3: Engine Yearly Settlement Hooks

**Files:**
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

- [ ] **Step 1: Write the failing engine integration test**

Add this test to `src/game/engine.test.ts`:

```ts
import { migrateLifeState } from './migrations';
import { applyForCareer } from './systems/careerSystem';
import { ageUp } from './engine';

it('settles P1 education and career during age up for v2 lives', () => {
  const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 44 }));
  const adult = { ...base, currentEvent: null, character: { ...base.character, age: 22, attributes: { ...base.character.attributes, smarts: 75 } }, education: { ...base.education, level: 'university' as const, graduated: true } };
  const employed = applyForCareer(adult, 'career.cashier');
  const result = ageUp(employed, 'education-career-engine');
  expect(result.character.money).toBeGreaterThan(employed.character.money);
  expect(result.career.yearsInRole).toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: FAIL because `ageUp` does not call P1 education and career settlement.

- [ ] **Step 3: Modify engine orchestration for this subsystem only**

In `src/game/engine.ts`, import the system functions:

```ts
import { settleCareerYear } from './systems/careerSystem';
import { settleEducationYear } from './systems/educationSystem';
import type { LifeStateV2 } from './lifeStateV2';
```

Inside `ageUp`, after the existing v1 age/school/job update and before death checking, normalize v2 lives through only these settlement functions:

```ts
const settledLife =
  agedLife.version === 2
    ? settleCareerYear(settleEducationYear(agedLife as LifeStateV2))
    : agedLife;
const deathCheck = maybeDie(settledLife, createSeededRandom(`${String(seed)}:death:${nextAge}`));
```

Keep the rest of `ageUp` unchanged.

- [ ] **Step 4: Run targeted and full game tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts src/game/systems/educationSystem.test.ts src/game/systems/careerSystem.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 5: Commit engine hook**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/engine.ts src/game/engine.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: settle p1 education and career years"
```

## Self-Review

- Scope is limited to `educationSystem`, `careerSystem`, their tests, and engine yearly hooks for these systems.
- UI, store actions, relationships, family, assets, health, crime, prison, achievements, and content expansion are handled by sibling plans.
- The implementation uses existing seed catalogs and does not commit raw Wiki or generated extract data.
