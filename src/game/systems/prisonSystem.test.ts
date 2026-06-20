import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { attemptCrime } from './crimeSystem';
import { attemptAppeal, settlePrisonYear } from './prisonSystem';

const incarceratedLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 42 }));
  const adult = { ...life, character: { ...life.character, age: 25, money: 2000 } };
  return attemptCrime(adult, 'crime.bank_robbery', 0.99);
};

describe('prisonSystem', () => {
  it('reduces remaining sentence during yearly settlement', () => {
    const prisoner = incarceratedLife();
    const result = settlePrisonYear(prisoner);

    expect(result.prison.remainingYears).toBe(prisoner.prison.remainingYears - 1);
    expect(result.stats.prisonYears).toBe(1);
  });

  it('releases the character when sentence reaches zero', () => {
    const prisoner = incarceratedLife();
    const finalYear = { ...prisoner, prison: { ...prisoner.prison, remainingYears: 1 } };
    const result = settlePrisonYear(finalYear);

    expect(result.prison.incarcerated).toBe(false);
    expect(result.prison.remainingYears).toBe(0);
  });

  it('allows a successful appeal once and applies the appeal activity cost', () => {
    const result = attemptAppeal(incarceratedLife(), 0.99);

    expect(result.prison.incarcerated).toBe(false);
    expect(result.prison.appealAvailable).toBe(false);
    expect(result.character.money).toBe(500);
  });

  it('consumes appeal availability when the appeal fails', () => {
    const result = attemptAppeal(incarceratedLife(), 0);

    expect(result.prison.incarcerated).toBe(true);
    expect(result.prison.appealAvailable).toBe(false);
  });
});
