import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { enrollInProgram, settleEducationYear } from './educationSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 7 }));
  return { ...life, character: { ...life.character, age: 18, money: 20000, attributes: { ...life.character.attributes, smarts: 70 } } };
};

describe('educationSystem', () => {
  it('enrolls an eligible adult in university and charges tuition', () => {
    const result = enrollInProgram(adultLife(), 'education.university');
    expect(result.education.level).toBe('university');
    expect(result.education.majorId).toBe('education.university');
    expect(result.education.graduated).toBe(false);
    expect(result.character.money).toBe(4000);
  });

  it('rejects programs when smarts or money requirements are not met', () => {
    const life = { ...adultLife(), character: { ...adultLife().character, money: 1000, attributes: { ...adultLife().character.attributes, smarts: 20 } } };
    expect(enrollInProgram(life, 'education.university')).toBe(life);
  });

  it('settles school grade and stress each year without graduating early', () => {
    const enrolled = enrollInProgram(adultLife(), 'education.community_college');
    const result = settleEducationYear(enrolled);
    expect(result.education.grade).toBe(enrolled.education.grade + 1);
    expect(result.education.stress).toBeGreaterThanOrEqual(enrolled.education.stress);
    expect(result.education.graduated).toBe(false);
  });

  it('marks a program graduated after its duration', () => {
    const enrolled = enrollInProgram(adultLife(), 'education.community_college');
    const yearOne = settleEducationYear(enrolled);
    const yearTwo = settleEducationYear(yearOne);
    expect(yearTwo.education.graduated).toBe(true);
    expect(yearTwo.education.level).toBe('community_college');
  });
});
