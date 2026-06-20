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
  eventMatchesLife,
  findJob,
  getSchoolState,
  pickNextEvent,
} from './engine';
import { migrateLifeState } from './migrations';
import { createSeededRandom, pickWeighted } from './random';
import { applyForCareer } from './systems/careerSystem';
import type { LifeStateV2 } from './lifeStateV2';
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
    'birth_rainy',
    'birth_busy_home',
    'birth_quiet_night',
    'birth_small_apartment',
    'child_book',
    'child_neighbor',
    'child_lost_toy',
    'child_tree_climb',
    'child_first_drawing',
    'child_puddle_jump',
    'child_shared_snack',
    'child_library_card',
    'child_bedtime_question',
    'child_music_corner',
    'school_test',
    'school_group_project',
    'school_bully_choice',
    'school_art_day',
    'school_sports_day',
    'school_science_board',
    'school_late_homework',
    'school_new_friend',
    'school_teacher_praise',
    'school_bus_delay',
    'family_meal',
    'family_argument',
    'family_sibling_game',
    'family_parent_tired',
    'family_weekend_cleaning',
    'family_small_gift',
    'family_photo_album',
    'family_sick_parent',
    'family_shared_errand',
    'family_holiday_call',
    'adult_walk',
    'adult_room_clean',
    'adult_old_friend',
    'adult_bad_sleep',
    'adult_crowded_train',
    'adult_new_hobby',
    'adult_quiet_cafe',
    'adult_missed_alarm',
    'adult_neighbor_help',
    'adult_long_queue',
    'work_rush',
    'work_kind_customer',
    'work_mistake',
    'work_extra_shift',
    'work_team_lunch',
    'work_confusing_email',
    'work_small_praise',
    'work_commute_delay',
    'work_desk_cleanup',
    'work_new_task',
    'money_wallet',
    'money_small_bonus',
    'money_broken_phone',
    'money_sale_choice',
    'money_unexpected_bill',
    'health_minor_fever',
    'health_knee_pain',
    'health_bad_meal',
    'health_good_sleep',
    'health_checkup_note',
    'elder_quiet_morning',
    'elder_memory_box',
    'elder_slow_walk',
    'elder_family_visit',
    'elder_old_song',
  ];

  it('ships enough original P0 events for the first playable loop', () => {
    expect(events.length).toBeGreaterThanOrEqual(requiredEventIds.length);
    expect(events.every((event) => event.choices.length >= 1)).toBe(true);

    const tags = new Set(events.flatMap((event) => event.tags));
    expect(Array.from(tags)).toEqual(
      expect.arrayContaining(['birth', 'child', 'school', 'family', 'adult', 'work', 'money', 'health', 'elder']),
    );
  });

  it('ships the required final P0 event ids without duplicates', () => {
    const eventIds = events.map((event) => event.id);

    expect(new Set(eventIds)).toHaveLength(eventIds.length);
    expect(eventIds).toEqual(expect.arrayContaining(requiredEventIds));
  });

  it('requires a job for every work-tagged event', () => {
    const workEvents = events.filter((event) => event.tags.includes('work'));

    expect(workEvents.length).toBeGreaterThan(0);
    expect(workEvents.every((event) => event.requires?.hasJob === true)).toBe(true);
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

  it('ships enough visible activities with cost and feedback metadata', () => {
    expect(activities.length).toBeGreaterThanOrEqual(9);
    expect(activities.map((activity) => activity.id)).toContain('crime');
    expect(activities.every((activity) => typeof activity.cost === 'number')).toBe(true);
    expect(activities.every((activity) => typeof activity.resultKey === 'string')).toBe(true);
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
      ...activities.map((activity) => activity.summaryKey),
      ...activities.map((activity) => activity.resultKey),
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
    expect(life.usedActivitiesThisAge).toEqual([]);
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
      (state) => ageUp({ ...state, currentEvent: null }, 'school-seed'),
      life,
    );

    expect(ageSix.character.age).toBe(6);
    expect(ageSix.school.stage).toBe('elementary');
  });

  it('uses the required school stage boundaries', () => {
    expect(getSchoolState(5)).toMatchObject({ stage: 'none', grade: 0 });
    expect(getSchoolState(6)).toMatchObject({ stage: 'elementary', grade: 1 });
    expect(getSchoolState(12)).toMatchObject({ stage: 'elementary', grade: 7 });
    expect(getSchoolState(13)).toMatchObject({ stage: 'middle', grade: 1 });
    expect(getSchoolState(17)).toMatchObject({ stage: 'middle', grade: 5 });
    expect(getSchoolState(18)).toMatchObject({ stage: 'finished', grade: 0 });
  });

  it('does not overwrite an unresolved yearly event when aging up', () => {
    const life = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });

    expect(life.currentEvent).not.toBeNull();
    expect(ageUp(life, 'unresolved-event')).toBe(life);
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

  it('lets adults choose a specific qualified job instead of auto-selecting one', () => {
    const adult = ageUpTo(
      createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      18,
    );

    expect(findJob(adult, 'cashier').job?.jobId).toBe('cashier');

    const unqualified = {
      ...adult,
      character: {
        ...adult.character,
        attributes: { ...adult.character.attributes, smarts: 5 },
      },
    };

    expect(findJob(unqualified, 'support_agent')).toBe(unqualified);
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

  it('matches job-required events for v2 lives with active P1 careers', () => {
    const life = migrateLifeState(createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 15,
    }));
    const employed: LifeStateV2 = {
      ...life,
      character: { ...life.character, age: 24 },
      job: null,
      career: { currentJobId: 'career.cashier', performance: 50, yearsInRole: 1, retired: false },
    };
    const workEvent: LifeEvent = {
      id: 'p1_work_event',
      textKey: 'event.p1Work.text',
      minAge: 18,
      maxAge: 65,
      weight: 1,
      tags: ['work'],
      requires: { hasJob: true },
      choices: [
        {
          id: 'ok',
          textKey: 'event.p1Work.choice.ok',
          resultKey: 'event.p1Work.result.ok',
          effects: {},
        },
      ],
    };

    expect(eventMatchesLife(workEvent, employed)).toBe(true);
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

  it('applies school stress effects and clamps them', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });

    const stressed = applyActivity(life, { school: { stress: 35 } });
    const calm = applyActivity(stressed, { school: { stress: -80 } });

    expect(stressed.school.stress).toBe(35);
    expect(calm.school.stress).toBe(0);
    expect(life.school.stress).toBe(0);
  });

  it('matches events against attribute and status requirements', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    const gatedEvent: LifeEvent = {
      id: 'gated_event',
      textKey: 'event.gated.text',
      minAge: 0,
      maxAge: 120,
      weight: 1,
      tags: ['test'],
      requires: {
        minAttributes: { smarts: 60 },
        hasStatus: 'focused',
        missingStatus: 'stressed',
      },
      choices: [
        {
          id: 'ok',
          textKey: 'event.gated.choice.ok',
          resultKey: 'event.gated.result.ok',
          effects: {},
        },
      ],
    };

    expect(eventMatchesLife(gatedEvent, life)).toBe(false);
    expect(eventMatchesLife(gatedEvent, {
      ...life,
      character: {
        ...life.character,
        attributes: { ...life.character.attributes, smarts: 80 },
      },
      statuses: ['focused'],
    })).toBe(true);
    expect(eventMatchesLife(gatedEvent, {
      ...life,
      character: {
        ...life.character,
        attributes: { ...life.character.attributes, smarts: 80 },
      },
      statuses: ['focused', 'stressed'],
    })).toBe(false);
  });

  it('records activity feedback and never lets paid effects create debt', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });

    const next = applyActivity(life, { attributes: { health: 2 }, money: -200 }, 'activity.doctorVisit.result');

    expect(next.character.money).toBe(0);
    expect(next.log[0].textKey).toBe('activity.doctorVisit.result');
  });

  it('tracks once-per-age activity usage and resets it on age up', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });

    const rested = applyActivity(life, { attributes: { health: 2 } }, 'activity.rest.result', 'rest');
    const aged = ageUp({ ...rested, currentEvent: null }, 'reset-used-activities');

    expect(rested.usedActivitiesThisAge).toEqual(['rest']);
    expect(aged.usedActivitiesThisAge).toEqual([]);
  });

  it('settles P1 education and career during age up for v2 lives', () => {
    const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 44 }));
    const adult = { ...base, currentEvent: null, character: { ...base.character, age: 22, attributes: { ...base.character.attributes, smarts: 75 } }, education: { ...base.education, level: 'university' as const, graduated: true } };
    const employed = applyForCareer(adult, 'career.cashier');
    const result: LifeStateV2 = ageUp(employed, 'education-career-engine');
    expect(result.character.money).toBeGreaterThan(employed.character.money);
    expect(result.career.yearsInRole).toBe(1);
  });

  it('does not double settle legacy job salary for v2 lives with P1 careers', () => {
    const base = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 45 }));
    const employed: LifeStateV2 = {
      ...base,
      currentEvent: null,
      character: { ...base.character, age: 22, money: 1000 },
      job: { jobId: 'cashier', titleKey: 'job.cashier.title', salary: 18000, years: 4 },
      career: { currentJobId: 'career.software_analyst', performance: 50, yearsInRole: 0, retired: false },
      education: { ...base.education, level: 'university', graduated: true },
    };

    const result = ageUp(employed, 'no-double-salary');

    expect(result.character.money).toBe(63000);
    expect(result.job?.years).toBe(4);
    expect(result.career.yearsInRole).toBe(1);
    expect(result.stats.totalIncome).toBe(62000);
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
