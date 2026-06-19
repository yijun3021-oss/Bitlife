import type { LifeEventOption } from '../game/types';

type ActivityEffects = LifeEventOption['effects'];

export interface ActivityConfig {
  id: string;
  titleKey: string;
  summaryKey: string;
  resultKey: string;
  minAge: number;
  cost: number;
  effects: ActivityEffects;
}

export const activities: ActivityConfig[] = [
  {
    id: 'rest',
    titleKey: 'ui.action.rest',
    summaryKey: 'activity.rest.summary',
    resultKey: 'activity.rest.result',
    minAge: 0,
    cost: 0,
    effects: { attributes: { health: 6, happiness: 2 } },
  },
  {
    id: 'study',
    titleKey: 'ui.action.study',
    summaryKey: 'activity.study.summary',
    resultKey: 'activity.study.result',
    minAge: 6,
    cost: 0,
    effects: { attributes: { smarts: 5, happiness: -2 } },
  },
  {
    id: 'family_time',
    titleKey: 'ui.action.familyTime',
    summaryKey: 'activity.familyTime.summary',
    resultKey: 'activity.familyTime.result',
    minAge: 0,
    cost: 0,
    effects: { attributes: { happiness: 4 }, relationship: { type: 'mother', closeness: 4 } },
  },
  {
    id: 'doctor_visit',
    titleKey: 'ui.action.doctorVisit',
    summaryKey: 'activity.doctorVisit.summary',
    resultKey: 'activity.doctorVisit.result',
    minAge: 0,
    cost: 200,
    effects: { attributes: { health: 12 }, money: -200 },
  },
  {
    id: 'exercise',
    titleKey: 'ui.action.exercise',
    summaryKey: 'activity.exercise.summary',
    resultKey: 'activity.exercise.result',
    minAge: 6,
    cost: 0,
    effects: { attributes: { health: 4, happiness: 1 } },
  },
  {
    id: 'socialize',
    titleKey: 'ui.action.socialize',
    summaryKey: 'activity.socialize.summary',
    resultKey: 'activity.socialize.result',
    minAge: 13,
    cost: 20,
    effects: { attributes: { happiness: 4 }, money: -20 },
  },
  {
    id: 'hobby_class',
    titleKey: 'ui.action.hobbyClass',
    summaryKey: 'activity.hobbyClass.summary',
    resultKey: 'activity.hobbyClass.result',
    minAge: 16,
    cost: 80,
    effects: { attributes: { happiness: 2, smarts: 2 }, money: -80 },
  },
  {
    id: 'meditate',
    titleKey: 'ui.action.meditate',
    summaryKey: 'activity.meditate.summary',
    resultKey: 'activity.meditate.result',
    minAge: 10,
    cost: 0,
    effects: { attributes: { happiness: 3, health: 1 }, removeStatus: 'stressed' },
  },
  {
    id: 'overtime',
    titleKey: 'ui.action.overtime',
    summaryKey: 'activity.overtime.summary',
    resultKey: 'activity.overtime.result',
    minAge: 18,
    cost: 0,
    effects: { attributes: { health: -2, happiness: -1 }, money: 180 },
  },
  {
    id: 'find_job',
    titleKey: 'ui.action.findJob',
    summaryKey: 'activity.findJob.summary',
    resultKey: 'activity.findJob.result',
    minAge: 18,
    cost: 0,
    effects: {},
  },
];
