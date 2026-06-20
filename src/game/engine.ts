import { events } from '../content/events';
import { jobs } from '../content/jobs';
import { familyNames, givenNames } from '../content/names';
import { clampAttribute } from './attributes';
import { createSeededRandom, pickWeighted, type RandomSource } from './random';
import { settleAssetYear } from './systems/assetSystem';
import { settleCareerYear } from './systems/careerSystem';
import { settleEducationYear } from './systems/educationSystem';
import { settleFamilyYear } from './systems/familySystem';
import { settleHealthYear } from './systems/healthSystem';
import { settleRelationshipYear } from './systems/relationshipSystem';
import { PASS_EVENT_CHOICE_ID } from './types';
import type { LifeStateV2 } from './lifeStateV2';
import type {
  Attributes,
  EducationStatus,
  Gender,
  LifeEvent,
  LifeEventOption,
  LifeLogEntry,
  LifeStage,
  LifeState,
  Locale,
  Relationship,
  RelationshipActionId,
  RelationshipKind,
} from './types';

interface NewLifeInput {
  name: string;
  gender: Gender;
  countryId: string;
  locale: Locale;
  seed: string | number;
}

type ChoiceEffects = LifeEventOption['effects'];
type GameLifeState = LifeState | LifeStateV2;

export { clampAttribute };

const relationshipInteractions: Record<
  RelationshipActionId,
  { closeness: number; happiness: number; action: string }
> = {
  talk: { closeness: 3, happiness: 1, action: 'talked with' },
  spend_time: { closeness: 5, happiness: 2, action: 'spent time with' },
  argue: { closeness: -6, happiness: -1, action: 'argued with' },
};

export function getLifeStage(age: number): LifeStage {
  if (age <= 2) {
    return 'infant';
  }
  if (age <= 12) {
    return 'child';
  }
  if (age <= 17) {
    return 'teen';
  }
  if (age <= 64) {
    return 'adult';
  }
  return 'elder';
}

export function getSchoolState(age: number, previous?: EducationStatus): EducationStatus {
  const stress = previous?.stress ?? 0;

  if (age < 6) {
    return { stage: 'none', grade: 0, stress: clampAttribute(stress - 5) };
  }
  if (age <= 12) {
    return { stage: 'elementary', grade: age - 5, stress };
  }
  if (age < 18) {
    return { stage: 'middle', grade: age - 12, stress };
  }
  return { stage: 'finished', grade: 0, stress: clampAttribute(stress - 10) };
}

export function pickNextEvent(life: GameLifeState, seed: string | number = `${life.character.id}:${life.character.age}`): LifeEvent | null {
  if (!life.character.alive) {
    return null;
  }

  const matches = events.filter((event) => eventMatchesLife(event, life));
  if (matches.length === 0) {
    return null;
  }

  return pickWeighted(
    matches.map((event) => ({ item: event, weight: event.weight })),
    createSeededRandom(String(seed)),
  );
}

export function createNewLife(input: NewLifeInput): LifeState {
  const random = createSeededRandom(String(input.seed));
  const attributes: Attributes = {
    happiness: 70,
    health: 75,
    smarts: 45,
    looks: 50,
  };
  const character = {
    id: `life_${safeId(input.name)}_${String(input.seed)}`,
    name: input.name,
    gender: input.gender,
    countryId: input.countryId,
    age: 0,
    alive: true,
    attributes,
    money: 0,
  };
  const birthLog = makeLogEntry(0, 'log.birth', 0, { name: input.name });
  const life: LifeState = {
    version: 1,
    locale: input.locale,
    character,
    relationships: createFamily(input.name, random),
    school: getSchoolState(0),
    job: null,
    statuses: [],
    usedActivitiesThisAge: [],
    currentEvent: null,
    log: [birthLog],
    deathSummary: null,
  };

  return {
    ...life,
    currentEvent: pickNextEvent(life, `${String(input.seed)}:event:0`),
  };
}

export function applyChoice(life: LifeState, choiceId: string): LifeState {
  if (!life.character.alive || life.currentEvent === null) {
    return life;
  }

  if (choiceId === PASS_EVENT_CHOICE_ID) {
    return {
      ...life,
      currentEvent: null,
      log: [
        makeLogEntry(life.character.age, 'log.eventPassed', life.log.length),
        ...life.log,
      ],
    };
  }

  const choice = life.currentEvent.choices.find((option) => option.id === choiceId);
  if (choice === undefined) {
    return life;
  }

  const updated = applyEffect(life, choice.effects);
  return {
    ...updated,
    currentEvent: null,
    log: [
      makeLogEntry(updated.character.age, choice.resultKey, updated.log.length),
      ...updated.log,
    ],
  };
}

export function calculateDeathRisk(age: number, health: number, statuses: string[]): number {
  const ageRisk =
    age < 50 ? 0.001 + age * 0.00005
    : age < 70 ? 0.01 + (age - 50) * 0.0015
    : 0.04 + (age - 70) * 0.008;
  const lowHealthRisk = health >= 50 ? 0 : (50 - health) * 0.0035;
  const statusRisk = statuses.reduce((risk, status) => {
    if (status === 'frail') {
      return risk + 0.08;
    }
    if (status === 'injured') {
      return risk + 0.04;
    }
    if (status === 'sick') {
      return risk + 0.03;
    }
    return risk + 0.01;
  }, 0);

  return Math.min(0.85, Math.max(0, ageRisk + lowHealthRisk + statusRisk));
}

export function ageUp(life: LifeStateV2, seed?: string | number): LifeStateV2;
export function ageUp(life: LifeState, seed?: string | number): LifeState;
export function ageUp(
  life: LifeState | LifeStateV2,
  seed: string | number = `${life.character.id}:age`,
): LifeState | LifeStateV2 {
  if (!life.character.alive || life.currentEvent !== null) {
    return life;
  }

  const nextAge = life.character.age + 1;
  const shouldSettleLegacyJob = life.version === 1;
  const salary = shouldSettleLegacyJob ? life.job?.salary ?? 0 : 0;
  const agedLife: GameLifeState = {
    ...life,
    character: {
      ...life.character,
      age: nextAge,
      money: life.character.money + salary,
    },
    school: getSchoolState(nextAge, life.school),
    job: shouldSettleLegacyJob && life.job !== null ? { ...life.job, years: life.job.years + 1 } : life.job,
    usedActivitiesThisAge: [],
    currentEvent: null,
    log: [
      ...(salary > 0 ? [makeLogEntry(nextAge, 'log.salary', life.log.length + 1, { amount: salary })] : []),
      makeLogEntry(nextAge, 'log.ageUp', life.log.length, { name: life.character.name, age: nextAge }),
      ...life.log,
    ],
  };
  const settledLife: GameLifeState =
    agedLife.version === 2
      ? settleFamilyYear(
        settleRelationshipYear(
          settleHealthYear(
            settleAssetYear(settleCareerYear(settleEducationYear(agedLife as LifeStateV2))),
          ),
        ),
      )
      : agedLife;
  const deathCheck = maybeDie(settledLife, createSeededRandom(`${String(seed)}:death:${nextAge}`));

  if (!deathCheck.character.alive) {
    return deathCheck;
  }

  return {
    ...deathCheck,
    currentEvent: pickNextEvent(deathCheck, `${String(seed)}:event:${nextAge}`),
  };
}

export function findJob(life: LifeState, jobId?: string): LifeState {
  if (!life.character.alive || life.character.age < 18 || life.job !== null) {
    return life;
  }

  const qualifiedJobs = jobs.filter((job) => life.character.attributes.smarts >= job.smartsMin);
  const selected = jobId === undefined
    ? qualifiedJobs.reduce((best, job) => (job.smartsMin > best.smartsMin ? job : best), qualifiedJobs[0])
    : qualifiedJobs.find((job) => job.id === jobId);

  if (selected === undefined) {
    return life;
  }

  return {
    ...life,
    job: {
      jobId: selected.id,
      titleKey: selected.titleKey,
      salary: selected.salary,
      years: 0,
    },
    log: [
      makeLogEntry(life.character.age, 'log.jobAccepted', life.log.length, { job: selected.titleKey, salary: selected.salary }),
      ...life.log,
    ],
  };
}

export function applyActivity(
  life: LifeState,
  activityEffect: ChoiceEffects,
  resultKey?: string,
  activityId?: string,
): LifeState {
  if (!life.character.alive) {
    return life;
  }
  const updated = applyEffect(life, activityEffect);
  const currentUsedActivities = updated.usedActivitiesThisAge ?? [];
  const usedActivitiesThisAge =
    activityId === undefined || currentUsedActivities.includes(activityId)
      ? currentUsedActivities
      : [...currentUsedActivities, activityId];
  const updatedWithUsage: LifeState = {
    ...updated,
    usedActivitiesThisAge,
  };

  if (resultKey === undefined) {
    return updatedWithUsage;
  }

  return {
    ...updatedWithUsage,
    log: [
      makeLogEntry(updatedWithUsage.character.age, resultKey, updatedWithUsage.log.length),
      ...updatedWithUsage.log,
    ],
  };
}

export function interactWithRelationship(
  life: LifeState,
  relationshipId: string,
  actionId: RelationshipActionId,
): LifeState {
  if (!life.character.alive) {
    return life;
  }

  const relationship = life.relationships.find((item) => item.id === relationshipId);
  const interaction = relationshipInteractions[actionId];
  if (relationship === undefined || interaction === undefined) {
    return life;
  }

  const updated = applyEffect(life, { attributes: { happiness: interaction.happiness } });
  const relationships = updated.relationships.map((item) => {
    if (item.id !== relationshipId) {
      return item;
    }
    return {
      ...item,
      closeness: clampAttribute(item.closeness + interaction.closeness),
    };
  });

  return {
    ...updated,
    relationships,
    log: [
      makeLogEntry(updated.character.age, 'log.relationshipInteraction', updated.log.length, {
        action: interaction.action,
        name: relationship.name,
      }),
      ...updated.log,
    ],
  };
}

export function eventMatchesLife(event: LifeEvent, life: GameLifeState): boolean {
  if (life.character.age < event.minAge || life.character.age > event.maxAge) {
    return false;
  }
  if (event.requires?.schoolStage !== undefined && event.requires.schoolStage !== life.school.stage) {
    return false;
  }
  if (event.requires?.hasJob !== undefined && event.requires.hasJob !== hasActiveJob(life)) {
    return false;
  }
  if (!attributesMeetMinimum(life.character.attributes, event.requires?.minAttributes)) {
    return false;
  }
  if (!attributesMeetMaximum(life.character.attributes, event.requires?.maxAttributes)) {
    return false;
  }
  if (event.requires?.hasStatus !== undefined && !life.statuses.includes(event.requires.hasStatus)) {
    return false;
  }
  if (event.requires?.missingStatus !== undefined && life.statuses.includes(event.requires.missingStatus)) {
    return false;
  }
  return true;
}

function hasActiveJob(life: GameLifeState): boolean {
  if (life.version === 2) {
    return life.career.currentJobId !== null && !life.career.retired;
  }
  return life.job !== null;
}

function applyEffect(life: LifeState, effect: ChoiceEffects): LifeState {
  const attributes = applyAttributeEffect(life.character.attributes, effect.attributes);
  const relationships = effect.relationship === undefined
    ? life.relationships
    : applyRelationshipEffect(life.relationships, effect.relationship.type, effect.relationship.closeness);
  const school = effect.school === undefined
    ? life.school
    : {
      ...life.school,
      stress: clampAttribute(life.school.stress + (effect.school.stress ?? 0)),
    };
  const statuses = applyStatusEffect(life.statuses, effect.addStatus, effect.removeStatus);

  return {
    ...life,
    character: {
      ...life.character,
      attributes,
      money: Math.max(0, life.character.money + (effect.money ?? 0)),
    },
    relationships,
    school,
    statuses,
  };
}

function attributesMeetMinimum(attributes: Attributes, minimums?: Partial<Attributes>): boolean {
  if (minimums === undefined) {
    return true;
  }

  return Object.entries(minimums).every(([key, value]) => {
    if (value === undefined) {
      return true;
    }
    return attributes[key as keyof Attributes] >= value;
  });
}

function attributesMeetMaximum(attributes: Attributes, maximums?: Partial<Attributes>): boolean {
  if (maximums === undefined) {
    return true;
  }

  return Object.entries(maximums).every(([key, value]) => {
    if (value === undefined) {
      return true;
    }
    return attributes[key as keyof Attributes] <= value;
  });
}

function applyAttributeEffect(attributes: Attributes, effect: Partial<Attributes> = {}): Attributes {
  return {
    happiness: clampAttribute(attributes.happiness + (effect.happiness ?? 0)),
    health: clampAttribute(attributes.health + (effect.health ?? 0)),
    smarts: clampAttribute(attributes.smarts + (effect.smarts ?? 0)),
    looks: clampAttribute(attributes.looks + (effect.looks ?? 0)),
  };
}

function applyRelationshipEffect(
  relationships: Relationship[],
  type: RelationshipKind,
  closenessChange: number,
): Relationship[] {
  return relationships.map((relationship) => {
    if (relationship.type !== type) {
      return relationship;
    }
    return {
      ...relationship,
      closeness: clampAttribute(relationship.closeness + closenessChange),
    };
  });
}

function applyStatusEffect(statuses: string[], addStatus?: string, removeStatus?: string): string[] {
  const removed = removeStatus === undefined ? statuses : statuses.filter((status) => status !== removeStatus);
  if (addStatus === undefined || removed.includes(addStatus)) {
    return removed;
  }
  return [...removed, addStatus];
}

function maybeDie<TLife extends GameLifeState>(life: TLife, random: RandomSource): TLife {
  const risk = calculateDeathRisk(life.character.age, life.character.attributes.health, life.statuses);
  if (random.next() >= risk) {
    return life;
  }

  const deathLog = makeLogEntry(life.character.age, 'log.death', life.log.length, { age: life.character.age });
  return {
    ...life,
    character: {
      ...life.character,
      alive: false,
    },
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

function getDeathCauseKey(life: GameLifeState): 'death.oldAge' | 'death.poorHealth' | 'death.accident' {
  if (life.character.attributes.health <= 25) {
    return 'death.poorHealth';
  }
  if (life.character.age >= 85) {
    return 'death.oldAge';
  }
  return 'death.accident';
}

function createFamily(characterName: string, random: RandomSource): Relationship[] {
  const familyName = characterName.trim().split(/\s+/).at(-1) ?? pickName(familyNames, random);
  const mother: Relationship = {
    id: 'rel_mother',
    name: `${pickName(givenNames, random)} ${familyName}`,
    type: 'mother',
    closeness: 70,
    alive: true,
  };
  const father: Relationship = {
    id: 'rel_father',
    name: `${pickName(givenNames, random)} ${familyName}`,
    type: 'father',
    closeness: 65,
    alive: true,
  };
  const sibling: Relationship = {
    id: 'rel_sibling',
    name: `${pickName(givenNames, random)} ${familyName}`,
    type: 'sibling',
    closeness: 55,
    alive: true,
  };

  return random.next() > 0.35 ? [mother, father, sibling] : [mother, father];
}

function pickName(names: readonly string[], random: RandomSource): string {
  return names[Math.floor(random.next() * names.length)] ?? names[0];
}

function makeLogEntry(
  age: number,
  textKey: string,
  logLength: number,
  values?: Record<string, string | number>,
): LifeLogEntry {
  return {
    id: `log_${age}_${logLength}_${safeId(textKey)}`,
    age,
    textKey,
    values,
  };
}

function safeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'entry';
}
