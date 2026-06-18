import { describe, expect, it } from 'vitest';
import { clampAttribute } from './engine';
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
