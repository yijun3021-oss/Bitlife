import { achievements, type AchievementCatalogItem } from '../../content/catalog/achievements';
import type { LifeStateV2 } from '../lifeStateV2';

export function unlockAchievements(life: LifeStateV2): LifeStateV2 {
  const unlocked = new Set(life.achievements.unlocked);

  for (const achievement of achievements) {
    if (isUnlockedByState(life, achievement)) {
      unlocked.add(achievement.id);
    }
  }

  return { ...life, achievements: { unlocked: [...unlocked] } };
}

function isUnlockedByState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (achievement.id === 'achievement.long_life') {
    return life.character.age >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.first_million') {
    return life.character.money >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.steady_career') {
    return life.career.currentJobId !== null && life.career.yearsInRole >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.family_anchor') {
    return life.family.childrenIds.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.second_chance') {
    return life.stats.prisonYears >= achievement.targetValue;
  }

  return false;
}
