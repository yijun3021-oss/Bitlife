import type { CatalogItem } from '../schema/catalogTypes';

export type EducationLevel = 'none' | 'community_college' | 'university';

export interface CareerCatalogItem extends CatalogItem {
  salary: number;
  smartsMin: number;
  educationLevel: EducationLevel;
  tier: number;
}

const careersSource = { sourceTitle: 'Careers/Jobs', sourcePage: 'Careers/Jobs' };

export const careers: CareerCatalogItem[] = [
  {
    id: 'career.cashier',
    titleKey: 'catalog.career.cashier.title',
    summaryKey: 'catalog.career.cashier.summary',
    salary: 18000,
    smartsMin: 0,
    educationLevel: 'none',
    tier: 1,
    sourceRefs: [careersSource],
  },
  {
    id: 'career.office_assistant',
    titleKey: 'catalog.career.officeAssistant.title',
    summaryKey: 'catalog.career.officeAssistant.summary',
    salary: 26000,
    smartsMin: 35,
    educationLevel: 'none',
    tier: 1,
    sourceRefs: [careersSource],
  },
  {
    id: 'career.nurse_assistant',
    titleKey: 'catalog.career.nurseAssistant.title',
    summaryKey: 'catalog.career.nurseAssistant.summary',
    salary: 34000,
    smartsMin: 45,
    educationLevel: 'community_college',
    tier: 2,
    sourceRefs: [careersSource],
  },
  {
    id: 'career.software_analyst',
    titleKey: 'catalog.career.softwareAnalyst.title',
    summaryKey: 'catalog.career.softwareAnalyst.summary',
    salary: 62000,
    smartsMin: 65,
    educationLevel: 'university',
    tier: 3,
    sourceRefs: [careersSource],
  },
  {
    id: 'career.junior_law_clerk',
    titleKey: 'catalog.career.juniorLawClerk.title',
    summaryKey: 'catalog.career.juniorLawClerk.summary',
    salary: 52000,
    smartsMin: 70,
    educationLevel: 'university',
    tier: 3,
    sourceRefs: [careersSource],
  },
];
