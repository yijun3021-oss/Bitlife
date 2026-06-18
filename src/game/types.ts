export type LocaleCode = 'zh-CN' | 'en-US';
export type Gender = 'female' | 'male' | 'non_binary';
export type LifeStage = 'infant' | 'child' | 'teen' | 'adult' | 'elder';
export type RelationshipType = 'mother' | 'father' | 'sibling';
export type SchoolStage = 'none' | 'elementary' | 'middle' | 'finished';

export interface AttributeState {
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
}

export interface Character {
  id: string;
  name: string;
  gender: Gender;
  countryId: string;
  age: number;
  alive: boolean;
  attributes: AttributeState;
  money: number;
}

export interface Relationship {
  id: string;
  name: string;
  type: RelationshipType;
  closeness: number;
  alive: boolean;
}

export interface SchoolState {
  stage: SchoolStage;
  grade: number;
  stress: number;
}

export interface JobState {
  jobId: string;
  titleKey: string;
  salary: number;
  years: number;
}

export interface LifeLogEntry {
  id: string;
  age: number;
  textKey: string;
  values?: Record<string, string | number>;
}

export interface Effect {
  attributes?: Partial<AttributeState>;
  money?: number;
  relationship?: {
    type: RelationshipType;
    closeness: number;
  };
  addStatus?: string;
  removeStatus?: string;
}

export interface EventChoice {
  id: string;
  textKey: string;
  resultKey: string;
  effects: Effect;
}

export interface LifeEvent {
  id: string;
  textKey: string;
  minAge: number;
  maxAge: number;
  weight: number;
  tags: string[];
  requires?: {
    schoolStage?: SchoolStage;
    hasJob?: boolean;
  };
  choices: EventChoice[];
}

export interface DeathSummary {
  age: number;
  causeKey: string;
  netWorth: number;
  logKey: string;
}

export interface LifeState {
  version: 1;
  locale: LocaleCode;
  character: Character;
  relationships: Relationship[];
  school: SchoolState;
  job: JobState | null;
  statuses: string[];
  currentEvent: LifeEvent | null;
  log: LifeLogEntry[];
  deathSummary: DeathSummary | null;
}
