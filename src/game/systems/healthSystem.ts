import { diseases } from '../../content/catalog/diseases';
import type { EffectConfig } from '../../content/schema/catalogTypes';
import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';
import type { Attributes } from '../types';

export function contractDisease(life: LifeStateV2, diseaseId: string): LifeStateV2 {
  const disease = diseases.find((item) => item.id === diseaseId);
  if (disease === undefined || life.health.diseases.includes(diseaseId)) {
    return life;
  }

  const affectedLife = applyDiseaseEffects(life, disease.effects);

  return {
    ...affectedLife,
    health: { ...affectedLife.health, diseases: [...affectedLife.health.diseases, diseaseId] },
  };
}

export function treatDisease(life: LifeStateV2, diseaseId: string, treatmentId: string): LifeStateV2 {
  if (!life.health.diseases.includes(diseaseId)) {
    return life;
  }

  return {
    ...life,
    health: {
      diseases: life.health.diseases.filter((item) => item !== diseaseId),
      treatmentHistory: [...life.health.treatmentHistory, { diseaseId, treatmentId, age: life.character.age, recovered: true }],
    },
    stats: { ...life.stats, diseasesRecovered: life.stats.diseasesRecovered + 1 },
  };
}

export function settleHealthYear(life: LifeStateV2): LifeStateV2 {
  const yearlyHealthImpact = life.health.diseases.reduce((total, diseaseId) => {
    const disease = diseases.find((item) => item.id === diseaseId);
    return total + (disease?.yearlyHealthImpact ?? 0);
  }, 0);
  if (yearlyHealthImpact === 0) {
    return life;
  }

  return {
    ...life,
    character: {
      ...life.character,
      attributes: { ...life.character.attributes, health: clampAttribute(life.character.attributes.health + yearlyHealthImpact) },
    },
  };
}

function applyDiseaseEffects(life: LifeStateV2, effects: EffectConfig): LifeStateV2 {
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
