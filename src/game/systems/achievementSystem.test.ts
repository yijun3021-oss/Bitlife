import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { unlockAchievements } from './achievementSystem';

const adultLife = () => migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 43 }));

describe('achievementSystem', () => {
  it('unlocks steady career achievement from career state', () => {
    const life = {
      ...adultLife(),
      career: { currentJobId: 'career.cashier', performance: 50, yearsInRole: 10, retired: false },
    };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.steady_career');
  });

  it('does not duplicate unlocked achievements', () => {
    const life = {
      ...adultLife(),
      achievements: { unlocked: ['achievement.steady_career'] },
      career: { currentJobId: 'career.cashier', performance: 50, yearsInRole: 10, retired: false },
    };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked.filter((id) => id === 'achievement.steady_career')).toHaveLength(1);
  });

  it('unlocks second chance achievement from prison years', () => {
    const life = { ...adultLife(), stats: { ...adultLife().stats, prisonYears: 1 } };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.second_chance');
  });
});
