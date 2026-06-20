import { careers } from '../content/catalog/careers';
import type { LifeState } from './types';
import type { LifeStateV2 } from './lifeStateV2';

function migrateLegacyJobId(jobId: string | undefined): string | null {
  if (jobId === undefined) {
    return null;
  }

  const p1JobId = `career.${jobId}`;
  return careers.some((career) => career.id === p1JobId) ? p1JobId : null;
}

export function migrateLifeState(life: LifeState | LifeStateV2): LifeStateV2 {
  if (life.version === 2) {
    return life;
  }

  return {
    ...life,
    version: 2,
    education: {
      level: life.school.stage,
      majorId: null,
      grade: life.school.grade,
      stress: life.school.stress,
      graduated: life.school.stage === 'finished',
    },
    career: {
      currentJobId: migrateLegacyJobId(life.job?.jobId),
      performance: 50,
      yearsInRole: life.job?.years ?? 0,
      retired: false,
    },
    family: {
      spouseId: null,
      childrenIds: [],
      marriageCount: 0,
      divorceCount: 0,
      adoptionCount: 0,
    },
    assets: [],
    licenses: {
      driving: false,
      boat: false,
      flight: false,
    },
    health: {
      diseases: [],
      treatmentHistory: [],
    },
    criminalRecord: {
      arrests: [],
      convictions: [],
    },
    prison: {
      incarcerated: false,
      remainingYears: 0,
      behavior: 50,
      appealAvailable: false,
      paroleEligible: false,
    },
    achievements: {
      unlocked: [],
    },
    stats: {
      totalIncome: 0,
      workYears: life.job?.years ?? 0,
      crimesSucceeded: 0,
      prisonYears: 0,
      diseasesRecovered: 0,
    },
  };
}
