import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { contractDisease, settleHealthYear, treatDisease } from './healthSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 32 }));
  return { ...life, character: { ...life.character, age: 35, money: 10000 } };
};

describe('healthSystem', () => {
  it('adds common cold once and applies its status without immediate health loss', () => {
    const life = adultLife();
    const result = contractDisease(life, 'disease.common_cold');
    expect(result.health.diseases).toContain('disease.common_cold');
    expect(result.statuses).toContain('sick');
    expect(result.character.attributes.health).toBe(life.character.attributes.health);
    expect(contractDisease(result, 'disease.common_cold')).toBe(result);
  });

  it('applies non-health disease attributes from the catalog', () => {
    const life = adultLife();
    const result = contractDisease(life, 'disease.migraine');
    expect(result.health.diseases).toContain('disease.migraine');
    expect(result.statuses).toContain('sick');
    expect(result.character.attributes.happiness).toBe(life.character.attributes.happiness - 3);
    expect(result.character.attributes.health).toBe(life.character.attributes.health);
  });

  it('treats an existing disease and records recovery', () => {
    const sick = contractDisease(adultLife(), 'disease.common_cold');
    const result = treatDisease(sick, 'disease.common_cold', 'doctor');
    expect(result.health.diseases).not.toContain('disease.common_cold');
    expect(result.health.treatmentHistory[0]).toMatchObject({ diseaseId: 'disease.common_cold', treatmentId: 'doctor', recovered: true });
    expect(result.stats.diseasesRecovered).toBe(1);
  });

  it('applies exact catalog health impact during yearly settlement', () => {
    const life = adultLife();
    const sick = { ...life, health: { ...life.health, diseases: ['disease.common_cold'] } };
    const result = settleHealthYear(sick);
    expect(result.character.attributes.health).toBe(sick.character.attributes.health - 4);
  });

  it('ignores unknown stale disease ids during yearly settlement', () => {
    const life = adultLife();
    const stale = { ...life, health: { ...life.health, diseases: ['disease.unknown'] } };
    const result = settleHealthYear(stale);
    expect(result).toBe(stale);
  });
});
