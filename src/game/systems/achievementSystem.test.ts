import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import type { LifeStateV2 } from '../lifeStateV2';
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

  it('unlocks cash savings achievements without treating cash as asset ownership', () => {
    const base = adultLife();
    const life: LifeStateV2 = { ...base, character: { ...base.character, money: 5000 }, assets: [] };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.rainy_day_fund');
    expect(result.achievements.unlocked).not.toContain('achievement.asset_collector');
    expect(result.achievements.unlocked).not.toContain('achievement.property_owner');
    expect(result.achievements.unlocked).not.toContain('achievement.luxury_purchase');
    expect(result.achievements.unlocked).not.toContain('achievement.debt_free_dream');
  });

  it('keeps cash savings achievements locked when cash is below the target', () => {
    const base = adultLife();
    const life = { ...base, character: { ...base.character, money: 4999 } };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).not.toContain('achievement.rainy_day_fund');
  });

  it('unlocks asset wealth achievements from owned asset semantics', () => {
    const base = adultLife();
    const life: LifeStateV2 = {
      ...base,
      character: { ...base.character, money: 0 },
      assets: [
        { id: 'owned_home', catalogId: 'asset.starter_condo', value: 85000, purchaseAge: 30 },
        { id: 'owned_car', catalogId: 'asset.hybrid_hatchback', value: 24000, purchaseAge: 31 },
        { id: 'owned_luxury', catalogId: 'asset.sports_coupe', value: 62000, purchaseAge: 32 },
      ],
    };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.asset_collector');
    expect(result.achievements.unlocked).toContain('achievement.property_owner');
    expect(result.achievements.unlocked).toContain('achievement.car_buyer');
    expect(result.achievements.unlocked).toContain('achievement.luxury_purchase');
  });

  it('does not unlock relationship achievements from default relatives alone', () => {
    const result = unlockAchievements(adultLife());

    expect(result.achievements.unlocked).not.toContain('achievement.first_love_goal');
    expect(result.achievements.unlocked).not.toContain('achievement.married_life');
    expect(result.achievements.unlocked).not.toContain('achievement.parent_life');
    expect(result.achievements.unlocked).not.toContain('achievement.trusted_sibling');
  });

  it('unlocks relationship achievements from specific relationship state', () => {
    const base = adultLife();
    const life: LifeStateV2 = {
      ...base,
      relationships: [
        ...base.relationships.filter((relationship) => relationship.type !== 'sibling'),
        { id: 'rel_sibling', name: 'Lena Lin', type: 'sibling', closeness: 95, alive: true },
        { id: 'rel_partner', name: 'Alex Park', type: 'partner', closeness: 80, alive: true },
        { id: 'rel_child', name: 'Jamie Lin', type: 'child', closeness: 85, alive: true },
      ],
      family: {
        ...base.family,
        spouseId: 'rel_partner',
        childrenIds: ['rel_child'],
        marriageCount: 1,
      },
    };
    const result = unlockAchievements(life);

    expect(result.achievements.unlocked).toContain('achievement.first_love_goal');
    expect(result.achievements.unlocked).toContain('achievement.married_life');
    expect(result.achievements.unlocked).toContain('achievement.parent_life');
    expect(result.achievements.unlocked).toContain('achievement.trusted_sibling');
  });

  it('does not duplicate non-hard-coded achievement unlocks', () => {
    const base = adultLife();
    const life = {
      ...base,
      character: { ...base.character, money: 5000 },
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
