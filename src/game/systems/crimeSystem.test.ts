import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { attemptCrime } from './crimeSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 41 }));
  return { ...life, character: { ...life.character, age: 25 } };
};

describe('crimeSystem', () => {
  it('records a successful low risk crime and applies catalog effects', () => {
    const result = attemptCrime(adultLife(), 'crime.shoplifting', 0);

    expect(result.stats.crimesSucceeded).toBe(1);
    expect(result.character.money).toBe(120);
    expect(result.statuses).toContain('suspicious');
    expect(result.criminalRecord.arrests).toEqual([]);
  });

  it('records arrest and conviction when a crime fails', () => {
    const result = attemptCrime(adultLife(), 'crime.bank_robbery', 0.99);

    expect(result.criminalRecord.arrests).toHaveLength(1);
    expect(result.criminalRecord.convictions).toHaveLength(1);
    expect(result.prison.incarcerated).toBe(true);
    expect(result.prison.remainingYears).toBeGreaterThan(0);
  });

  it('does not allow crimes before the catalog minimum age', () => {
    const child = { ...adultLife(), character: { ...adultLife().character, age: 10 } };

    expect(attemptCrime(child, 'crime.shoplifting', 0)).toBe(child);
  });
});
