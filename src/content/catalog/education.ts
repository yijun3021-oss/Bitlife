import type { CatalogItem } from '../schema/catalogTypes';

export type EducationProgramLevel = 'secondary' | 'community_college' | 'university';

export interface EducationProgramCatalogItem extends CatalogItem {
  level: EducationProgramLevel;
  minAge: number;
  durationYears: number;
  tuition: number;
  smartsMin: number;
}

export const educationPrograms: EducationProgramCatalogItem[] = [
  {
    id: 'education.high_school',
    titleKey: 'catalog.education.highSchool.title',
    summaryKey: 'catalog.education.highSchool.summary',
    level: 'secondary',
    minAge: 14,
    durationYears: 4,
    tuition: 0,
    smartsMin: 0,
    sourceRefs: [{ sourceTitle: 'Education/Faculty Staff', sourcePage: 'Education/Faculty Staff' }],
  },
  {
    id: 'education.community_college',
    titleKey: 'catalog.education.communityCollege.title',
    summaryKey: 'catalog.education.communityCollege.summary',
    level: 'community_college',
    minAge: 18,
    durationYears: 2,
    tuition: 6000,
    smartsMin: 35,
    sourceRefs: [{ sourceTitle: 'Community college', sourcePage: 'Community college' }],
  },
  {
    id: 'education.university',
    titleKey: 'catalog.education.university.title',
    summaryKey: 'catalog.education.university.summary',
    level: 'university',
    minAge: 18,
    durationYears: 4,
    tuition: 16000,
    smartsMin: 55,
    sourceRefs: [{ sourceTitle: 'Careers', sourcePage: 'Careers', sourceSection: 'Education' }],
  },
];
