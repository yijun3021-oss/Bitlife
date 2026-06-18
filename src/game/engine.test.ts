import { describe, expect, it } from 'vitest';
import { activities } from '../content/activities';
import { countries } from '../content/countries';
import { events } from '../content/events';
import { jobs } from '../content/jobs';
import { enUS } from '../i18n/locales/en-US';
import { zhCN } from '../i18n/locales/zh-CN';
import {
  ageUp,
  applyActivity,
  applyChoice,
  calculateDeathRisk,
  clampAttribute,
  createNewLife,
  findJob,
  pickNextEvent,
} from './engine';
import { createSeededRandom, pickWeighted } from './random';
import type {
  AttributeName,
  Attributes,
  EducationStatus,
  Gender,
  Job,
  LifeEvent,
  LifeEventOption,
  LifeEventResult,
  LifeLogEntry,
  LifeStage,
  LifeState,
  Locale,
  Relationship,
  RelationshipKind,
  WorkStatus,
} from './types';

interface TypeContract {
  locale: Locale;
  attributeName: AttributeName;
  attributes: Attributes;
  educationStatus: EducationStatus;
  gender: Gender;
  job: Job;
  lifeEvent: LifeEvent;
  lifeEventOption: LifeEventOption;
  lifeEventResult: LifeEventResult;
  lifeLogEntry: LifeLogEntry;
  lifeStage: LifeStage;
  lifeState: LifeState;
  relationship: Relationship;
  relationshipKind: RelationshipKind;
  workStatus: WorkStatus;
}

describe('game primitives', () => {
  it('exports the required domain type contract', () => {
    expect({} as TypeContract).toBeDefined();
  });

  it('clamps attributes into the 0-100 range', () => {
    expect(clampAttribute(-10)).toBe(0);
    expect(clampAttribute(44)).toBe(44);
    expect(clampAttribute(140)).toBe(100);
  });

  it('picks weighted items deterministically with a seeded random source', () => {
    const items = [
      { item: 'a', weight: 1 },
      { item: 'b', weight: 2 },
      { item: 'c', weight: 7 },
    ];
    const firstRun = createSeededRandom('life-7');
    const secondRun = createSeededRandom('life-7');
    const differentSeed = createSeededRandom('life-8');

    const sequence = Array.from({ length: 8 }, () => pickWeighted(items, firstRun));
    const repeatedSequence = Array.from({ length: 8 }, () => pickWeighted(items, secondRun));
    const differentSequence = Array.from({ length: 8 }, () => pickWeighted(items, differentSeed));

    expect(sequence).toEqual(repeatedSequence);
    expect(sequence).not.toEqual(differentSequence);
  });

  it('picks weighted items according to roll thresholds', () => {
    const items = [
      { item: 'a', weight: 1 },
      { item: 'b', weight: 2 },
      { item: 'c', weight: 7 },
    ];

    expect(pickWeighted(items, { next: () => 0.05 })).toBe('a');
    expect(pickWeighted(items, { next: () => 0.2 })).toBe('b');
    expect(pickWeighted(items, { next: () => 0.95 })).toBe('c');
  });
});

describe('seed content', () => {
  const requiredEventIds = [
    'birth_sunny',
    'child_book',
    'school_test',
    'family_meal',
    'adult_walk',
    'work_rush',
    'money_wallet',
    'birth_rainy',
    'birth_busy_home',
    'child_neighbor',
    'child_lost_toy',
    'child_tree_climb',
    'school_group_project',
    'school_bully_choice',
    'school_art_day',
    'school_sports_day',
    'family_argument',
    'family_sibling_game',
    'family_parent_tired',
    'adult_room_clean',
    'adult_old_friend',
    'adult_bad_sleep',
    'work_kind_customer',
    'work_mistake',
    'work_extra_shift',
    'money_small_bonus',
    'money_broken_phone',
    'health_minor_fever',
    'health_knee_pain',
    'elder_quiet_morning',
    'elder_memory_box',
  ];

  it('ships enough original P0 events for the first playable loop', () => {
    expect(events.length).toBeGreaterThanOrEqual(24);
    expect(events.every((event) => event.choices.length >= 1)).toBe(true);
  });

  it('ships exactly the required Task 4 event ids', () => {
    const eventIds = events.map((event) => event.id);

    expect(eventIds).toHaveLength(requiredEventIds.length);
    expect(new Set(eventIds)).toHaveLength(requiredEventIds.length);
    expect([...eventIds].sort()).toEqual([...requiredEventIds].sort());
  });

  it('requires a job for work bonus events', () => {
    expect(events.find((event) => event.id === 'money_small_bonus')?.requires).toEqual({ hasJob: true });
  });

  it('ships ordinary jobs for adult gameplay', () => {
    expect(jobs.map((job) => job.id)).toEqual([
      'cashier',
      'office_assistant',
      'cook',
      'driver',
      'support_agent',
    ]);
  });

  it('ships locale text for all seed content keys', () => {
    const localeKeys = [
      ...events.flatMap((event) => [
        event.textKey,
        ...event.choices.flatMap((choice) => [choice.textKey, choice.resultKey]),
      ]),
      ...countries.map((country) => country.nameKey),
      ...jobs.map((job) => job.titleKey),
      ...activities.map((activity) => activity.titleKey),
    ];
    const zhKeys = zhCN as Record<string, string>;
    const enKeys = enUS as Record<string, string>;

    expect(localeKeys.every((key) => key in zhKeys)).toBe(true);
    expect(localeKeys.every((key) => key in enKeys)).toBe(true);
  });
});

describe('life engine', () => {
  it('creates a new life with family, school, log, and current event', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });

    expect(life.character.age).toBe(0);
    expect(life.character.alive).toBe(true);
    expect(life.relationships.map((person) => person.type)).toContain('mother');
    expect(life.relationships.map((person) => person.type)).toContain('father');
    expect(life.currentEvent).not.toBeNull();
    expect(life.log[0].textKey).toBe('log.birth');
  });

  it('applies choice effects and records the result', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const choice = life.currentEvent?.choices[0];
    expect(choice).toBeDefined();

    const next = applyChoice(life, choice!.id);
    expect(next.log[0].textKey).toBe(choice!.resultKey);
  });

  it('ages up, pays salary, and updates school stage', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const ageSix = Array.from({ length: 6 }).reduce<ReturnType<typeof createNewLife>>(
      (state) => ageUp(state, 'school-seed'),
      life,
    );

    expect(ageSix.character.age).toBe(6);
    expect(ageSix.school.stage).toBe('elementary');
  });

  it('raises death risk when health is low', () => {
    expect(calculateDeathRisk(30, 80, [])).toBeLessThan(calculateDeathRisk(30, 10, []));
    expect(calculateDeathRisk(82, 80, [])).toBeGreaterThan(calculateDeathRisk(30, 80, []));
  });

  it('finds cashier for low smarts and the best qualified job for high smarts', () => {
    const adult = ageUpTo(
      createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      18,
    );
    const lowSmarts = {
      ...adult,
      character: {
        ...adult.character,
        attributes: { ...adult.character.attributes, smarts: 5 },
      },
    };
    const highSmarts = {
      ...adult,
      character: {
        ...adult.character,
        attributes: { ...adult.character.attributes, smarts: 95 },
      },
    };

    expect(findJob(lowSmarts).job?.jobId).toBe('cashier');
    expect(findJob(highSmarts).job?.jobId).toBe('support_agent');
  });

  it('only allows job-required events after the life has a job', () => {
    const adult = ageUpTo(
      createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      30,
    );
    const withoutJobEvents = Array.from({ length: 20 }, (_, index) => pickNextEvent(adult, `work-${index}`));
    const employed = findJob(adult);
    const withJobEvents = Array.from({ length: 40 }, (_, index) => pickNextEvent(employed, `work-${index}`));

    expect(withoutJobEvents.some((event) => event?.requires?.hasJob === true)).toBe(false);
    expect(withJobEvents.some((event) => event?.requires?.hasJob === true)).toBe(true);
  });

  it('applies activity effects immutably and clamps attributes', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    const next = applyActivity(life, {
      attributes: { happiness: 40, health: -100 },
      relationship: { type: 'mother', closeness: 40 },
      money: 25,
      addStatus: 'rested',
    });

    expect(next.character.attributes.happiness).toBe(100);
    expect(next.character.attributes.health).toBe(0);
    expect(next.relationships.find((person) => person.type === 'mother')?.closeness).toBe(100);
    expect(next.character.money).toBe(25);
    expect(next.statuses).toContain('rested');
    expect(life.character.attributes.happiness).toBe(70);
    expect(life.character.attributes.health).toBe(75);
    expect(life.character.money).toBe(0);
    expect(life.statuses).toEqual([]);
  });

  it('records death log and an existing death cause key for deterministic high-risk death', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    const highRisk: LifeState = {
      ...life,
      character: {
        ...life.character,
        age: 95,
        attributes: { ...life.character.attributes, health: 0 },
        money: 1200,
      },
      school: { stage: 'finished', grade: 0, stress: 0 },
      statuses: ['frail'],
      currentEvent: null,
    };

    const next = ageUp(highRisk, 'death-seed');

    expect(next.character.alive).toBe(false);
    expect(next.log[0].textKey).toBe('log.death');
    expect(next.deathSummary).toEqual({
      age: 96,
      causeKey: 'death.poorHealth',
      netWorth: 1200,
      logKey: 'log.death',
    });
  });
});

function ageUpTo(life: ReturnType<typeof createNewLife>, targetAge: number): ReturnType<typeof createNewLife> {
  return Array.from({ length: targetAge }).reduce<ReturnType<typeof createNewLife>>(
    (state, _, index) => ageUp({ ...state, currentEvent: null }, `age-${index}`),
    life,
  );
}
