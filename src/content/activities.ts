import type { LifeEventOption } from '../game/types';

type ActivityEffects = LifeEventOption['effects'];

export interface ActivityConfig {
  id: string;
  titleKey: string;
  minAge: number;
  effects: ActivityEffects;
}

export const activities: ActivityConfig[] = [
  { id: 'rest', titleKey: 'ui.action.rest', minAge: 0, effects: { attributes: { health: 6, happiness: 2 } } },
  { id: 'study', titleKey: 'ui.action.study', minAge: 6, effects: { attributes: { smarts: 5, happiness: -2 } } },
  {
    id: 'family_time',
    titleKey: 'ui.action.familyTime',
    minAge: 0,
    effects: { attributes: { happiness: 4 }, relationship: { type: 'mother', closeness: 4 } },
  },
  { id: 'doctor_visit', titleKey: 'ui.action.doctorVisit', minAge: 0, effects: { attributes: { health: 12 }, money: -200 } },
  { id: 'find_job', titleKey: 'ui.action.findJob', minAge: 18, effects: {} },
];
