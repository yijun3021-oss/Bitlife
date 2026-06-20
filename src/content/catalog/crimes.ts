import type { CatalogItem, EffectConfig } from '../schema/catalogTypes';

export type CrimeSeverity = 'petty' | 'serious' | 'violent';

export interface CrimeCatalogItem extends CatalogItem {
  severity: CrimeSeverity;
  minAge: number;
  successChance: number;
  sentenceYears: number;
  effects: EffectConfig;
}

const crimeSource = { sourceTitle: 'Crime', sourcePage: 'Crime' };

export const crimes: CrimeCatalogItem[] = [
  {
    id: 'crime.shoplifting',
    titleKey: 'catalog.crime.shoplifting.title',
    summaryKey: 'catalog.crime.shoplifting.summary',
    severity: 'petty',
    minAge: 12,
    successChance: 0.65,
    sentenceYears: 1,
    effects: { money: 120, addStatus: 'suspicious' },
    sourceRefs: [crimeSource],
  },
  {
    id: 'crime.burglary',
    titleKey: 'catalog.crime.burglary.title',
    summaryKey: 'catalog.crime.burglary.summary',
    severity: 'serious',
    minAge: 16,
    successChance: 0.45,
    sentenceYears: 4,
    effects: { money: 1200, addStatus: 'suspicious' },
    sourceRefs: [crimeSource],
  },
  {
    id: 'crime.grand_theft_auto',
    titleKey: 'catalog.crime.grandTheftAuto.title',
    summaryKey: 'catalog.crime.grandTheftAuto.summary',
    severity: 'serious',
    minAge: 16,
    successChance: 0.35,
    sentenceYears: 5,
    effects: { money: 3500, addStatus: 'suspicious' },
    sourceRefs: [crimeSource],
  },
  {
    id: 'crime.bank_robbery',
    titleKey: 'catalog.crime.bankRobbery.title',
    summaryKey: 'catalog.crime.bankRobbery.summary',
    severity: 'violent',
    minAge: 18,
    successChance: 0.22,
    sentenceYears: 12,
    effects: { money: 25000, addStatus: 'suspicious' },
    sourceRefs: [crimeSource],
  },
  {
    id: 'crime.fraud',
    titleKey: 'catalog.crime.fraud.title',
    summaryKey: 'catalog.crime.fraud.summary',
    severity: 'serious',
    minAge: 18,
    successChance: 0.4,
    sentenceYears: 6,
    effects: { money: 6000, addStatus: 'suspicious' },
    sourceRefs: [crimeSource],
  },
];
