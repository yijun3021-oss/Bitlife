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

  it('unlocks a non-hard-coded wealth achievement when generic progress reaches the target', () => {
    const life = { ...adultLife(), character: { ...adultLife().character, money: 5000 } };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.rainy_day_fund');
  });

  it('keeps a non-hard-coded wealth achievement locked when generic progress is below the target', () => {
    const life = { ...adultLife(), character: { ...adultLife().character, money: 4999 } };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).not.toContain('achievement.rainy_day_fund');
  });

  it('does not duplicate non-hard-coded achievement unlocks', () => {
    const life = {
      ...adultLife(),
      character: { ...adultLife().character, money: 5000 },
      achievements: { unlocked: ['achievement.rainy_day_fund'] },
    };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked.filter((id) => id === 'achievement.rainy_day_fund')).toHaveLength(1);
  });

  it('unlocks second chance achievement from prison years', () => {
    const life = { ...adultLife(), stats: { ...adultLife().stats, prisonYears: 1 } };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.second_chance');
  });
});
