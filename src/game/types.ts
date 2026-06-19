export type Locale = 'zh-CN' | 'en-US';
export type Gender = 'female' | 'male' | 'non_binary';
export type LifeStage = 'infant' | 'child' | 'teen' | 'adult' | 'elder';
export type RelationshipKind = 'mother' | 'father' | 'sibling';
export const PASS_EVENT_CHOICE_ID = 'pass_event';
type SchoolStage = 'none' | 'elementary' | 'middle' | 'finished';
export type AttributeName = keyof Attributes;

export interface Attributes {
  happiness: number;
  health: number;
  smarts: number;
  looks: number;
}

interface Character {
  id: string;
  name: string;
  gender: Gender;
  countryId: string;
  age: number;
  alive: boolean;
  attributes: Attributes;
  money: number;
}

export interface Relationship {
  id: string;
  name: string;
  type: RelationshipKind;
  closeness: number;
  alive: boolean;
}

export interface EducationStatus {
  stage: SchoolStage;
  grade: number;
  stress: number;
}

export interface Job {
  jobId: string;
  titleKey: string;
  salary: number;
  years: number;
}

export type WorkStatus = Job | null;

export interface LifeLogEntry {
  id: string;
  age: number;
  textKey: string;
  values?: Record<string, string | number>;
}

interface Effect {
  attributes?: Partial<Attributes>;
  money?: number;
  relationship?: {
    type: RelationshipKind;
    closeness: number;
  };
  addStatus?: string;
  removeStatus?: string;
}

export interface LifeEventResult {
  resultKey: string;
  effects: Effect;
}

export interface LifeEventOption extends LifeEventResult {
  id: string;
  textKey: string;
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
  choices: LifeEventOption[];
}

interface DeathSummary {
  age: number;
  causeKey: string;
  netWorth: number;
  logKey: string;
}

export interface LifeState {
  version: 1;
  locale: Locale;
  character: Character;
  relationships: Relationship[];
  school: EducationStatus;
  job: WorkStatus;
  statuses: string[];
  currentEvent: LifeEvent | null;
  log: LifeLogEntry[];
  deathSummary: DeathSummary | null;
}
