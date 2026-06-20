import { describe, expect, it } from 'vitest';
import { createNewLife, findJob } from './engine';
import { migrateLifeState } from './migrations';
import type { EducationLevel, LifeStateV2 } from './lifeStateV2';

describe('life state migrations', () => {
  it('allows community college as a P1 education level', () => {
    const level: EducationLevel = 'community_college';
    expect(level).toBe('community_college');
  });

  it('migrates a v1 life to version 2 with P1 containers and preserved values', () => {
    const born = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const adult = {
      ...born,
      character: {
        ...born.character,
        age: 18,
        attributes: { ...born.character.attributes, smarts: 95 },
      },
      school: { stage: 'finished' as const, grade: 0, stress: 12 },
      currentEvent: null,
    };
    const employed = findJob(adult, 'support_agent');

    const migrated = migrateLifeState(employed);

    expect(migrated.version).toBe(2);
    expect(migrated.education).toEqual({
      level: 'finished',
      majorId: null,
      grade: employed.school.grade,
      stress: employed.school.stress,
      graduated: true,
    });
    expect(migrated.career).toEqual({
      currentJobId: employed.job?.jobId,
      performance: 50,
      yearsInRole: employed.job?.years,
      retired: false,
    });
    expect(migrated.family).toEqual({
      spouseId: null,
      childrenIds: [],
      marriageCount: 0,
      divorceCount: 0,
      adoptionCount: 0,
    });
    expect(migrated.assets).toEqual([]);
    expect(migrated.licenses).toEqual({ driving: false, boat: false, flight: false });
    expect(migrated.health).toEqual({ diseases: [], treatmentHistory: [] });
    expect(migrated.criminalRecord).toEqual({ arrests: [], convictions: [] });
    expect(migrated.prison).toEqual({
      incarcerated: false,
      remainingYears: 0,
      behavior: 50,
      appealAvailable: false,
      paroleEligible: false,
    });
    expect(migrated.achievements).toEqual({ unlocked: [] });
    expect(migrated.stats).toEqual({
      totalIncome: 0,
      workYears: employed.job?.years,
      crimesSucceeded: 0,
      prisonYears: 0,
      diseasesRecovered: 0,
    });
    expect(migrated.character).toEqual(employed.character);
    expect(migrated.relationships).toEqual(employed.relationships);
    expect(migrated.locale).toBe(employed.locale);
    expect(migrated.currentEvent).toEqual(employed.currentEvent);
    expect(migrated.log).toEqual(employed.log);
    expect(migrated.school).toEqual(employed.school);
    expect(migrated.job).toEqual(employed.job);
  });

  it('keeps existing P1 data when migrating an already-v2 life', () => {
    const v1 = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'zh-CN',
      seed: 12,
    });
    const v2: LifeStateV2 = {
      ...migrateLifeState(v1),
      education: {
        level: 'university',
        majorId: 'computer_science',
        grade: 92,
        stress: 34,
        graduated: false,
      },
      career: {
        currentJobId: 'developer',
        performance: 88,
        yearsInRole: 3,
        retired: false,
      },
      family: {
        spouseId: 'rel_spouse',
        childrenIds: ['rel_child_1'],
        marriageCount: 1,
        divorceCount: 0,
        adoptionCount: 1,
      },
      assets: [{ id: 'asset_car', catalogId: 'compact_car', value: 7000, purchaseAge: 24 }],
      licenses: { driving: true, boat: false, flight: true },
      health: {
        diseases: ['flu'],
        treatmentHistory: [{ diseaseId: 'flu', treatmentId: 'rest', age: 21, recovered: true }],
      },
      criminalRecord: {
        arrests: [{ id: 'arrest_1', crimeId: 'theft', age: 22 }],
        convictions: [{ id: 'conviction_1', crimeId: 'theft', age: 22, sentenceYears: 1 }],
      },
      prison: {
        incarcerated: true,
        remainingYears: 1,
        behavior: 72,
        appealAvailable: true,
        paroleEligible: false,
      },
      achievements: { unlocked: ['first_job'] },
      stats: {
        totalIncome: 12000,
        workYears: 3,
        crimesSucceeded: 2,
        prisonYears: 1,
        diseasesRecovered: 1,
      },
    };

    expect(migrateLifeState(v2)).toEqual(v2);
  });
});
