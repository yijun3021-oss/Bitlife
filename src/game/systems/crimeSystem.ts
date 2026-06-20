import { crimes } from '../../content/catalog/crimes';
import type { EffectConfig } from '../../content/schema/catalogTypes';
import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';
import type { Attributes } from '../types';

export function attemptCrime(life: LifeStateV2, crimeId: string, roll: number): LifeStateV2 {
  const crime = crimes.find((item) => item.id === crimeId);
  if (crime === undefined || life.prison.incarcerated || life.character.age < crime.minAge) {
    return life;
  }

  if (roll < crime.successChance) {
    const rewardedLife = applyCrimeEffects(life, crime.effects);
    return {
      ...rewardedLife,
      stats: { ...rewardedLife.stats, crimesSucceeded: rewardedLife.stats.crimesSucceeded + 1 },
    };
  }

  const arrest = {
    id: `arrest_${crime.id}_${life.character.age}_${life.criminalRecord.arrests.length}`,
    crimeId: crime.id,
    age: life.character.age,
  };
  const conviction = {
    id: `conviction_${crime.id}_${life.character.age}_${life.criminalRecord.convictions.length}`,
    crimeId: crime.id,
    age: life.character.age,
    sentenceYears: crime.sentenceYears,
  };

  return {
    ...life,
    criminalRecord: {
      arrests: [...life.criminalRecord.arrests, arrest],
      convictions: [...life.criminalRecord.convictions, conviction],
    },
    prison: {
      incarcerated: true,
      remainingYears: crime.sentenceYears,
      behavior: 50,
      appealAvailable: true,
      paroleEligible: crime.sentenceYears > 1,
    },
  };
}

function applyCrimeEffects(life: LifeStateV2, effects: EffectConfig): LifeStateV2 {
  const statusesWithoutRemoved =
    effects.removeStatus === undefined ? life.statuses : life.statuses.filter((status) => status !== effects.removeStatus);
  const statuses =
    effects.addStatus === undefined || statusesWithoutRemoved.includes(effects.addStatus)
      ? statusesWithoutRemoved
      : [...statusesWithoutRemoved, effects.addStatus];

  return {
    ...life,
    character: {
      ...life.character,
      attributes: applyAttributeEffects(life.character.attributes, effects.attributes),
      money: Math.max(0, life.character.money + (effects.money ?? 0)),
    },
    statuses,
  };
}

function applyAttributeEffects(attributes: Attributes, effects: Partial<Attributes> = {}): Attributes {
  return {
    happiness: clampAttribute(attributes.happiness + (effects.happiness ?? 0)),
    health: clampAttribute(attributes.health + (effects.health ?? 0)),
    smarts: clampAttribute(attributes.smarts + (effects.smarts ?? 0)),
    looks: clampAttribute(attributes.looks + (effects.looks ?? 0)),
  };
}
