import type { LifeState } from './types';

export type EducationLevel = LifeState['school']['stage'] | 'university';

export interface LifeStateV2 extends Omit<LifeState, 'version'> {
  version: 2;
  education: {
    level: EducationLevel;
    majorId: string | null;
    grade: number;
    stress: number;
    graduated: boolean;
  };
  career: {
    currentJobId: string | null;
    performance: number;
    yearsInRole: number;
    retired: boolean;
  };
  family: {
    spouseId: string | null;
    childrenIds: string[];
    marriageCount: number;
    divorceCount: number;
    adoptionCount: number;
  };
  assets: LifeAsset[];
  licenses: Record<LicenseKind, boolean>;
  health: {
    diseases: string[];
    treatmentHistory: TreatmentRecord[];
  };
  criminalRecord: {
    arrests: ArrestRecord[];
    convictions: ConvictionRecord[];
  };
  prison: {
    incarcerated: boolean;
    remainingYears: number;
    behavior: number;
    appealAvailable: boolean;
    paroleEligible: boolean;
  };
  achievements: {
    unlocked: string[];
  };
  stats: {
    totalIncome: number;
    workYears: number;
    crimesSucceeded: number;
    prisonYears: number;
    diseasesRecovered: number;
  };
}

export interface LifeAsset {
  id: string;
  catalogId: string;
  value: number;
  purchaseAge: number;
}

export type LicenseKind = 'driving' | 'boat' | 'flight';

export interface TreatmentRecord {
  diseaseId: string;
  treatmentId: string;
  age: number;
  recovered: boolean;
}

export interface ArrestRecord {
  id: string;
  crimeId: string;
  age: number;
}

export interface ConvictionRecord {
  id: string;
  crimeId: string;
  age: number;
  sentenceYears: number;
}
