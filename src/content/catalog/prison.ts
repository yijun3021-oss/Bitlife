import type { CatalogItem, EffectConfig } from '../schema/catalogTypes';

export type PrisonActivityRisk = 'low' | 'medium' | 'high';

export interface PrisonActivityCatalogItem extends CatalogItem {
  risk: PrisonActivityRisk;
  effects: EffectConfig;
}

const prisonActivitiesSource = { sourceTitle: 'Prison/Activities', sourcePage: 'Prison/Activities' };

export const prisonActivities: PrisonActivityCatalogItem[] = [
  {
    id: 'prison.appeal',
    titleKey: 'catalog.prison.appeal.title',
    summaryKey: 'catalog.prison.appeal.summary',
    risk: 'medium',
    effects: { money: -1500 },
    sourceRefs: [prisonActivitiesSource],
  },
  {
    id: 'prison.prison_yard',
    titleKey: 'catalog.prison.prisonYard.title',
    summaryKey: 'catalog.prison.prisonYard.summary',
    risk: 'low',
    effects: { attributes: { health: 2, happiness: 1 } },
    sourceRefs: [prisonActivitiesSource],
  },
  {
    id: 'prison.escape',
    titleKey: 'catalog.prison.escape.title',
    summaryKey: 'catalog.prison.escape.summary',
    risk: 'high',
    effects: { attributes: { happiness: -6 }, addStatus: 'suspicious' },
    sourceRefs: [prisonActivitiesSource],
  },
];
