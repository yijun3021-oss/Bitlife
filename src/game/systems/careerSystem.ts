import { careers, type CareerCatalogItem } from '../../content/catalog/careers';
import { clampAttribute } from '../engine';
import type { LifeStateV2 } from '../lifeStateV2';

function educationMeetsRequirement(life: LifeStateV2, career: CareerCatalogItem): boolean {
  if (career.educationLevel === 'none') {
    return true;
  }
  return life.education.level === career.educationLevel && life.education.graduated;
}

export function applyForCareer(life: LifeStateV2, careerId: string): LifeStateV2 {
  const career = careers.find((item) => item.id === careerId);
  if (career === undefined || life.character.age < 18 || life.career.currentJobId !== null) {
    return life;
  }
  if (life.character.attributes.smarts < career.smartsMin || !educationMeetsRequirement(life, career)) {
    return life;
  }

  return {
    ...life,
    career: { currentJobId: career.id, performance: 50, yearsInRole: 0, retired: false },
  };
}

export function settleCareerYear(life: LifeStateV2): LifeStateV2 {
  if (life.career.currentJobId === null || life.career.retired) {
    return life;
  }
  const career = careers.find((item) => item.id === life.career.currentJobId);
  if (career === undefined) {
    return life;
  }
  const salary = career.salary;
  return {
    ...life,
    character: { ...life.character, money: life.character.money + salary },
    career: {
      ...life.career,
      yearsInRole: life.career.yearsInRole + 1,
      performance: clampAttribute(life.career.performance + (life.character.attributes.smarts >= career.smartsMin + 10 ? 3 : 1)),
    },
    stats: {
      ...life.stats,
      totalIncome: life.stats.totalIncome + salary,
      workYears: life.stats.workYears + 1,
    },
  };
}
