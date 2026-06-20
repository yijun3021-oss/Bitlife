# P1 Relationships Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pure P1 relationship and family systems with actions for friendship, dating, marriage, children, divorce, and adoption.

**Architecture:** Keep relationship and family rules in separate pure modules under `src/game/systems`. Actions return updated `LifeStateV2` objects and append compatible log entries only when the existing log shape supports it; yearly settlement is limited to relationship drift and family aging.

**Tech Stack:** TypeScript, Vitest, existing `LifeStateV2`, existing `Relationship` model in `src/game/types.ts`, React/Vite app shell, Git.

---

## Current Context

Existing files to rely on:

- `src/game/lifeStateV2.ts` defines `family` and preserves the v1 `relationships` array.
- `src/game/engine.ts` already exports `interactWithRelationship` for v1 interactions.
- `src/content/catalog/relationships.ts` exports seed relationship event config.
- `src/game/types.ts` defines `Relationship`, `RelationshipKind`, and log entry shapes.

Do not touch UI panels in this plan. Do not commit generated `data/wiki-*` files or raw `wiki_dump` files.

## Files

- Create: `src/game/systems/relationshipSystem.ts`
- Create: `src/game/systems/relationshipSystem.test.ts`
- Create: `src/game/systems/familySystem.ts`
- Create: `src/game/systems/familySystem.test.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

## Task 0: Expand Relationship Kind Type

**Files:**
- Modify: `src/game/types.ts`
- Test: `src/game/engine.test.ts`

- [ ] **Step 1: Write the failing type-level relationship test**

Add this assertion to `src/game/engine.test.ts`:

```ts
import type { RelationshipKind } from './types';

it('allows P1 relationship kinds', () => {
  const kinds: RelationshipKind[] = ['friend', 'partner', 'spouse', 'ex', 'child'];
  expect(kinds).toContain('partner');
});
```

- [ ] **Step 2: Run test to verify it fails at compile time**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: FAIL because `RelationshipKind` does not yet include P1 relationship kinds.

- [ ] **Step 3: Update relationship kind union**

Modify `src/game/types.ts`:

```ts
export type RelationshipKind = 'mother' | 'father' | 'sibling' | 'friend' | 'partner' | 'spouse' | 'ex' | 'child';
```

- [ ] **Step 4: Run engine tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit relationship type alignment**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/types.ts src/game/engine.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: align p1 relationship kinds"
```

## Task 1: Relationship Actions

**Files:**
- Create: `src/game/systems/relationshipSystem.ts`
- Create: `src/game/systems/relationshipSystem.test.ts`

- [ ] **Step 1: Write failing relationship tests**

Create `src/game/systems/relationshipSystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { addRelationship, askOnDate, settleRelationshipYear } from './relationshipSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 12 }));
  return { ...life, character: { ...life.character, age: 24 } };
};

describe('relationshipSystem', () => {
  it('adds a friend relationship with a stable id', () => {
    const result = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 45 });
    expect(result.relationships).toContainEqual({ id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 45, alive: true });
  });

  it('turns a close friend into a partner when dating succeeds', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 80 });
    const result = askOnDate(withFriend, 'rel_alex');
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.type).toBe('partner');
  });

  it('does not date a low closeness friend', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 20 });
    expect(askOnDate(withFriend, 'rel_alex')).toBe(withFriend);
  });

  it('drifts relationship closeness during yearly settlement', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 80 });
    const result = settleRelationshipYear(withFriend);
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.closeness).toBe(78);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/relationshipSystem.test.ts
```

Expected: FAIL because `relationshipSystem.ts` does not exist.

- [ ] **Step 3: Implement minimal relationship system**

Create `src/game/systems/relationshipSystem.ts`:

```ts
import type { LifeStateV2 } from '../lifeStateV2';
import type { Relationship, RelationshipKind } from '../types';
import { clampAttribute } from '../engine';

export interface AddRelationshipInput {
  id: string;
  name: string;
  type: RelationshipKind;
  closeness: number;
}

export function addRelationship(life: LifeStateV2, input: AddRelationshipInput): LifeStateV2 {
  if (life.relationships.some((item) => item.id === input.id)) {
    return life;
  }
  const relationship: Relationship = {
    id: input.id,
    name: input.name,
    type: input.type,
    closeness: clampAttribute(input.closeness),
    alive: true,
  };
  return { ...life, relationships: [...life.relationships, relationship] };
}

export function askOnDate(life: LifeStateV2, relationshipId: string): LifeStateV2 {
  const relationship = life.relationships.find((item) => item.id === relationshipId);
  if (relationship === undefined || relationship.type !== 'friend' || relationship.closeness < 70) {
    return life;
  }
  return {
    ...life,
    relationships: life.relationships.map((item) =>
      item.id === relationshipId ? { ...item, type: 'partner', closeness: clampAttribute(item.closeness + 5) } : item,
    ),
  };
}

export function settleRelationshipYear(life: LifeStateV2): LifeStateV2 {
  return {
    ...life,
    relationships: life.relationships.map((item) => ({
      ...item,
      closeness: clampAttribute(item.closeness + (item.type === 'partner' || item.type === 'spouse' ? -1 : -2)),
    })),
  };
}
```

- [ ] **Step 4: Run relationship tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/relationshipSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit relationship system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/relationshipSystem.ts src/game/systems/relationshipSystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 relationship system"
```

## Task 2: Family Actions

**Files:**
- Create: `src/game/systems/familySystem.ts`
- Create: `src/game/systems/familySystem.test.ts`

- [ ] **Step 1: Write failing family tests**

Create `src/game/systems/familySystem.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { addRelationship } from './relationshipSystem';
import { adoptChild, divorceSpouse, marryPartner, settleFamilyYear } from './familySystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 21 }));
  return { ...life, character: { ...life.character, age: 30, money: 50000 } };
};

describe('familySystem', () => {
  it('marries a partner and stores spouse id', () => {
    const withPartner = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'partner', closeness: 82 });
    const result = marryPartner(withPartner, 'rel_alex');
    expect(result.family.spouseId).toBe('rel_alex');
    expect(result.family.marriageCount).toBe(1);
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.type).toBe('spouse');
  });

  it('divorces the active spouse', () => {
    const married = marryPartner(addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'partner', closeness: 82 }), 'rel_alex');
    const result = divorceSpouse(married);
    expect(result.family.spouseId).toBeNull();
    expect(result.family.divorceCount).toBe(1);
  });

  it('adopts a child when adult and solvent', () => {
    const result = adoptChild(adultLife(), { id: 'rel_child_mia', name: 'Mia Lin' });
    expect(result.family.childrenIds).toEqual(['rel_child_mia']);
    expect(result.family.adoptionCount).toBe(1);
    expect(result.character.money).toBe(35000);
  });

  it('settles family year without removing children', () => {
    const family = adoptChild(adultLife(), { id: 'rel_child_mia', name: 'Mia Lin' });
    expect(settleFamilyYear(family).family.childrenIds).toEqual(['rel_child_mia']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/familySystem.test.ts
```

Expected: FAIL because `familySystem.ts` does not exist.

- [ ] **Step 3: Implement minimal family system**

Create `src/game/systems/familySystem.ts`:

```ts
import type { LifeStateV2 } from '../lifeStateV2';

export function marryPartner(life: LifeStateV2, relationshipId: string): LifeStateV2 {
  const partner = life.relationships.find((item) => item.id === relationshipId);
  if (partner === undefined || partner.type !== 'partner' || partner.closeness < 75 || life.family.spouseId !== null) {
    return life;
  }
  return {
    ...life,
    family: { ...life.family, spouseId: relationshipId, marriageCount: life.family.marriageCount + 1 },
    relationships: life.relationships.map((item) => item.id === relationshipId ? { ...item, type: 'spouse' } : item),
  };
}

export function divorceSpouse(life: LifeStateV2): LifeStateV2 {
  if (life.family.spouseId === null) {
    return life;
  }
  const spouseId = life.family.spouseId;
  return {
    ...life,
    family: { ...life.family, spouseId: null, divorceCount: life.family.divorceCount + 1 },
    relationships: life.relationships.map((item) => item.id === spouseId ? { ...item, type: 'ex', closeness: Math.max(0, item.closeness - 35) } : item),
  };
}

export function adoptChild(life: LifeStateV2, child: { id: string; name: string }): LifeStateV2 {
  if (life.character.age < 21 || life.character.money < 15000 || life.family.childrenIds.includes(child.id)) {
    return life;
  }
  return {
    ...life,
    character: { ...life.character, money: life.character.money - 15000 },
    family: {
      ...life.family,
      childrenIds: [...life.family.childrenIds, child.id],
      adoptionCount: life.family.adoptionCount + 1,
    },
    relationships: [...life.relationships, { id: child.id, name: child.name, type: 'child', closeness: 70, alive: true }],
  };
}

export function settleFamilyYear(life: LifeStateV2): LifeStateV2 {
  return life;
}
```

- [ ] **Step 4: Run family tests**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/systems/familySystem.test.ts src/game/systems/relationshipSystem.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit family system**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/systems/familySystem.ts src/game/systems/familySystem.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: add p1 family system"
```

## Task 3: Engine Hooks for Relationship and Family Yearly Settlement

**Files:**
- Modify: `src/game/engine.ts`
- Test: `src/game/engine.test.ts`

- [ ] **Step 1: Add failing engine test**

Add to `src/game/engine.test.ts`:

```ts
import { addRelationship } from './systems/relationshipSystem';
import type { LifeStateV2 } from './lifeStateV2';

it('settles P1 relationships during age up for v2 lives', () => {
  const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 52 }));
  const adult = { ...base, currentEvent: null, character: { ...base.character, age: 25 } };
  const withFriend = addRelationship(adult, { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 80 });
  const result: LifeStateV2 = ageUp(withFriend, 'relationship-family-engine');
  expect(result.relationships.find((item) => item.id === 'rel_alex')?.closeness).toBe(78);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts
```

Expected: FAIL until `ageUp` exposes a `LifeStateV2` overload and relationship settlement is called from `ageUp`.

- [ ] **Step 3: Update public ageUp typing for v1 and v2 lives**

In `src/game/engine.ts`, import `LifeStateV2` if it is not already imported:

```ts
import type { LifeStateV2 } from './lifeStateV2';
```

Ensure the public `ageUp` function has v1 and v2 overloads:

```ts
export function ageUp(life: LifeStateV2, seed?: string | number): LifeStateV2;
export function ageUp(life: LifeState, seed?: string | number): LifeState;
export function ageUp(
  life: LifeState | LifeStateV2,
  seed: string | number = `${life.character.id}:age`,
): LifeState | LifeStateV2 {
```

If the education/career plan already added these overloads, verify they are still present and do not add duplicates.

- [ ] **Step 4: Update ageUp internals to preserve v2 containers**

In `src/game/engine.ts`, add or reuse this local union type near the top of the file:

```ts
type GameLifeState = LifeState | LifeStateV2;
```

Update event selection helpers to accept v2-compatible state:

```ts
export function pickNextEvent(life: GameLifeState, seed: string | number = `${life.character.id}:${life.character.age}`): LifeEvent | null {
```

```ts
export function eventMatchesLife(event: LifeEvent, life: GameLifeState): boolean {
```

Inside `ageUp`, type the yearly object as the union. Do not annotate it as `LifeState`, because that makes TypeScript forget `family`, `assets`, `health`, `criminalRecord`, `prison`, `achievements`, and `stats`:

```ts
const agedLife: GameLifeState = {
  ...life,
  character: {
    ...life.character,
    age: nextAge,
    money: life.character.money + salary,
  },
  school: getSchoolState(nextAge, life.school),
  job: life.job === null ? null : { ...life.job, years: life.job.years + 1 },
  usedActivitiesThisAge: [],
  currentEvent: null,
  log: [
    ...(salary > 0 ? [makeLogEntry(nextAge, 'log.salary', life.log.length + 1, { amount: salary })] : []),
    makeLogEntry(nextAge, 'log.ageUp', life.log.length, { name: life.character.name, age: nextAge }),
    ...life.log,
  ],
};
```

Update `maybeDie` to accept and return the same state version:

```ts
function maybeDie<TLife extends GameLifeState>(life: TLife, random: RandomSource): TLife {
  const risk = calculateDeathRisk(life.character.age, life.character.attributes.health, life.statuses);
  if (random.next() >= risk) {
    return life;
  }

  const deathLog = makeLogEntry(life.character.age, 'log.death', life.log.length, { age: life.character.age });
  return {
    ...life,
    character: { ...life.character, alive: false },
    currentEvent: null,
    deathSummary: {
      age: life.character.age,
      causeKey: getDeathCauseKey(life),
      netWorth: life.character.money,
      logKey: 'log.death',
    },
    log: [deathLog, ...life.log],
  } as TLife;
}
```

The return cast is limited to preserving the input state version after changing shared fields; it must not omit v2 containers.

- [ ] **Step 5: Wire yearly settlement**

In `src/game/engine.ts`, import:

```ts
import { settleFamilyYear } from './systems/familySystem';
import { settleRelationshipYear } from './systems/relationshipSystem';
```

In the v2 branch of `ageUp`, include only these sibling-plan hooks after education/career hooks if those already exist:

```ts
const settledLife: GameLifeState =
  agedLife.version === 2
    ? settleFamilyYear(settleRelationshipYear(agedLife as LifeStateV2))
    : agedLife;
```

If education/career hooks are already present, compose all existing hooks in this order: education, career, relationship, family.

- [ ] **Step 6: Run tests and build**

Run:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
& 'C:\Program Files\nodejs\npm.cmd' test -- src/game/engine.test.ts src/game/systems/relationshipSystem.test.ts src/game/systems/familySystem.test.ts
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: PASS and production build succeeds.

- [ ] **Step 7: Commit engine hooks**

Run:

```powershell
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' add src/game/engine.ts src/game/engine.test.ts
& 'C:\Users\OseasyVM\AppData\Local\Programs\Git\cmd\git.exe' commit -m "feat: settle p1 relationships and family years"
```

## Self-Review

- Scope is limited to relationship and family systems plus their engine settlement hooks.
- Store actions and UI controls are intentionally left for the UI integration plan.
- The plan uses existing model shapes and does not commit Wiki dump or generated extraction output.
