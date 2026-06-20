import type { CatalogItem } from '../schema/catalogTypes';

export type AchievementCategory = 'longevity' | 'wealth' | 'career' | 'relationship' | 'crime';

export interface AchievementCatalogItem extends CatalogItem {
  category: AchievementCategory;
  targetValue: number;
}

const achievementSource = { sourceTitle: 'Achievements', sourcePage: 'Achievements' };

export const achievements: AchievementCatalogItem[] = [
  {
    id: 'achievement.long_life',
    titleKey: 'catalog.achievement.longLife.title',
    summaryKey: 'catalog.achievement.longLife.summary',
    category: 'longevity',
    targetValue: 80,
    sourceRefs: [achievementSource],
  },
  {
    id: 'achievement.first_million',
    titleKey: 'catalog.achievement.firstMillion.title',
    summaryKey: 'catalog.achievement.firstMillion.summary',
    category: 'wealth',
    targetValue: 1000000,
    sourceRefs: [achievementSource],
  },
  {
    id: 'achievement.steady_career',
    titleKey: 'catalog.achievement.steadyCareer.title',
    summaryKey: 'catalog.achievement.steadyCareer.summary',
    category: 'career',
    targetValue: 10,
    sourceRefs: [achievementSource],
  },
  {
    id: 'achievement.family_anchor',
    titleKey: 'catalog.achievement.familyAnchor.title',
    summaryKey: 'catalog.achievement.familyAnchor.summary',
    category: 'relationship',
    targetValue: 5,
    sourceRefs: [achievementSource],
  },
  {
    id: 'achievement.second_chance',
    titleKey: 'catalog.achievement.secondChance.title',
    summaryKey: 'catalog.achievement.secondChance.summary',
    category: 'crime',
    targetValue: 1,
    sourceRefs: [achievementSource],
  },
];
