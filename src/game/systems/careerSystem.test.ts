import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { applyForCareer, settleCareerYear } from './careerSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 9 }));
  return { ...life, character: { ...life.character, age: 22, attributes: { ...life.character.attributes, smarts: 75 } }, education: { ...life.education, level: 'university' as const, graduated: true } };
};

describe('careerSystem', () => {
  it('accepts a qualified career application', () => {
    const result = applyForCareer(adultLife(), 'career.software_analyst');
    expect(result.career.currentJobId).toBe('career.software_analyst');
    expect(result.career.performance).toBe(50);
    expect(result.career.yearsInRole).toBe(0);
  });

  it('rejects applications when education is insufficient', () => {
    const life = { ...adultLife(), education: { ...adultLife().education, level: 'none' as const, graduated: false } };
    expect(applyForCareer(life, 'career.software_analyst')).toBe(life);
  });

  it('pays salary and advances years in role during yearly settlement', () => {
    const employed = applyForCareer(adultLife(), 'career.cashier');
    const result = settleCareerYear(employed);
    expect(result.character.money).toBe(employed.character.money + 18000);
    expect(result.career.yearsInRole).toBe(1);
    expect(result.stats.totalIncome).toBe(18000);
    expect(result.stats.workYears).toBe(1);
  });
});
