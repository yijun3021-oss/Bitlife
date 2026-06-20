import type { CatalogItem, EffectConfig } from '../schema/catalogTypes';

export type DiseaseSeverity = 'mild' | 'moderate' | 'severe';

export interface DiseaseCatalogItem extends CatalogItem {
  severity: DiseaseSeverity;
  yearlyHealthImpact: number;
  treatable: boolean;
  effects: EffectConfig;
}

export const diseases: DiseaseCatalogItem[] = [
  {
    id: 'disease.common_cold',
    titleKey: 'catalog.disease.commonCold.title',
    summaryKey: 'catalog.disease.commonCold.summary',
    severity: 'mild',
    yearlyHealthImpact: -4,
    treatable: true,
    effects: { addStatus: 'sick' },
    sourceRefs: [{ sourceTitle: 'Diseases', sourcePage: 'Diseases' }],
  },
  {
    id: 'disease.migraine',
    titleKey: 'catalog.disease.migraine.title',
    summaryKey: 'catalog.disease.migraine.summary',
    severity: 'moderate',
    yearlyHealthImpact: -7,
    treatable: true,
    effects: { attributes: { happiness: -3 }, addStatus: 'sick' },
    sourceRefs: [{ sourceTitle: 'Diseases', sourcePage: 'Diseases' }],
  },
  {
    id: 'disease.asthma',
    titleKey: 'catalog.disease.asthma.title',
    summaryKey: 'catalog.disease.asthma.summary',
    severity: 'moderate',
    yearlyHealthImpact: -6,
    treatable: true,
    effects: { attributes: { health: -3 }, addStatus: 'sick' },
    sourceRefs: [{ sourceTitle: 'Diseases', sourcePage: 'Diseases' }],
  },
  {
    id: 'disease.pneumonia',
    titleKey: 'catalog.disease.pneumonia.title',
    summaryKey: 'catalog.disease.pneumonia.summary',
    severity: 'severe',
    yearlyHealthImpact: -16,
    treatable: true,
    effects: { attributes: { health: -12 }, addStatus: 'sick' },
    sourceRefs: [{ sourceTitle: 'Diseases/Deadly diseases', sourcePage: 'Diseases/Deadly diseases' }],
  },
  {
    id: 'disease.cancer',
    titleKey: 'catalog.disease.cancer.title',
    summaryKey: 'catalog.disease.cancer.summary',
    severity: 'severe',
    yearlyHealthImpact: -22,
    treatable: true,
    effects: { attributes: { health: -18, happiness: -8 }, addStatus: 'sick' },
    sourceRefs: [{ sourceTitle: 'Diseases/Deadly diseases', sourcePage: 'Diseases/Deadly diseases' }],
  },
];
