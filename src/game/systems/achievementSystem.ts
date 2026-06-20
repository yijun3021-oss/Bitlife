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

  return getGenericAchievementProgress(life, achievement) >= achievement.targetValue;
}

function getGenericAchievementProgress(life: LifeStateV2, achievement: AchievementCatalogItem): number {
  if (achievement.category === 'longevity') {
    return life.character.age;
  }
  if (achievement.category === 'wealth') {
    return life.character.money + life.assets.reduce((total, asset) => total + asset.value, 0);
  }
  if (achievement.category === 'career') {
    return Math.max(
      life.career.currentJobId === null ? 0 : 1,
      life.career.yearsInRole,
      life.stats.workYears,
      life.stats.totalIncome,
    );
  }
  if (achievement.category === 'relationship') {
    return Math.max(
      life.relationships.filter((relationship) => relationship.alive).length,
      life.family.childrenIds.length + (life.family.spouseId === null ? 0 : 1),
      life.family.marriageCount,
      life.family.adoptionCount,
      ...life.relationships.map((relationship) => relationship.closeness),
    );
  }
  return Math.max(
    life.stats.crimesSucceeded,
    life.stats.prisonYears,
    life.criminalRecord.arrests.length,
    life.criminalRecord.convictions.length,
  );
}
