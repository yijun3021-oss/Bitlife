import { prisonActivities } from '../../content/catalog/prison';
import type { EffectConfig } from '../../content/schema/catalogTypes';
import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';
import type { Attributes } from '../types';

export function settlePrisonYear(life: LifeStateV2): LifeStateV2 {
  if (!life.prison.incarcerated) {
    return life;
  }

  const remainingYears = Math.max(0, life.prison.remainingYears - 1);
  return {
    ...life,
    prison: {
      ...life.prison,
      incarcerated: remainingYears > 0,
      remainingYears,
      paroleEligible: remainingYears > 1,
      appealAvailable: remainingYears > 0 && life.prison.appealAvailable,
    },
    stats: { ...life.stats, prisonYears: life.stats.prisonYears + 1 },
  };
}

export function attemptAppeal(life: LifeStateV2, roll: number): LifeStateV2 {
  if (!life.prison.incarcerated || !life.prison.appealAvailable) {
    return life;
  }

  const appealActivity = prisonActivities.find((item) => item.id === 'prison.appeal');
  const appealedLife = applyPrisonEffects(life, appealActivity?.effects ?? {});
  if (roll < 0.5) {
    return { ...appealedLife, prison: { ...appealedLife.prison, appealAvailable: false } };
  }

  return {
    ...appealedLife,
    prison: {
      ...appealedLife.prison,
      incarcerated: false,
      remainingYears: 0,
      appealAvailable: false,
      paroleEligible: false,
    },
  };
}

function applyPrisonEffects(life: LifeStateV2, effects: EffectConfig): LifeStateV2 {
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
