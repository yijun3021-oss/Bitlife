import { diseases } from '../../content/catalog/diseases';
import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';

export function contractDisease(life: LifeStateV2, diseaseId: string): LifeStateV2 {
  const disease = diseases.find((item) => item.id === diseaseId);
  if (disease === undefined || life.health.diseases.includes(diseaseId)) {
    return life;
  }

  return {
    ...life,
    character: {
      ...life.character,
      attributes: {
        ...life.character.attributes,
        health: clampAttribute(life.character.attributes.health + (disease.effects.attributes?.health ?? disease.yearlyHealthImpact)),
      },
    },
    health: { ...life.health, diseases: [...life.health.diseases, diseaseId] },
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
  const yearlyImpact = life.health.diseases.length * 5;
  if (yearlyImpact === 0) {
    return life;
  }

  return {
    ...life,
    character: {
      ...life.character,
      attributes: { ...life.character.attributes, health: clampAttribute(life.character.attributes.health - yearlyImpact) },
    },
  };
}
