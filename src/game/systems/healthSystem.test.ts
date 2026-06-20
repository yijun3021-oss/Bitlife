import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { contractDisease, settleHealthYear, treatDisease } from './healthSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 32 }));
  return { ...life, character: { ...life.character, age: 35, money: 10000 } };
};

describe('healthSystem', () => {
  it('adds a disease once and lowers health', () => {
    const result = contractDisease(adultLife(), 'disease.common_cold');
    expect(result.health.diseases).toContain('disease.common_cold');
    expect(result.character.attributes.health).toBeLessThan(adultLife().character.attributes.health);
    expect(contractDisease(result, 'disease.common_cold')).toBe(result);
  });

  it('treats an existing disease and records recovery', () => {
    const sick = contractDisease(adultLife(), 'disease.common_cold');
    const result = treatDisease(sick, 'disease.common_cold', 'doctor');
    expect(result.health.diseases).not.toContain('disease.common_cold');
    expect(result.health.treatmentHistory[0]).toMatchObject({ diseaseId: 'disease.common_cold', treatmentId: 'doctor', recovered: true });
    expect(result.stats.diseasesRecovered).toBe(1);
  });

  it('reduces health during yearly settlement when diseases are active', () => {
    const sick = contractDisease(adultLife(), 'disease.common_cold');
    const result = settleHealthYear(sick);
    expect(result.character.attributes.health).toBeLessThan(sick.character.attributes.health);
  });
});
