import { educationPrograms } from '../../content/catalog/education';
import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';

export function enrollInProgram(life: LifeStateV2, programId: string): LifeStateV2 {
  const program = educationPrograms.find((item) => item.id === programId);
  if (program === undefined || life.character.age < program.minAge) {
    return life;
  }
  if (life.character.attributes.smarts < program.smartsMin || life.character.money < program.tuition) {
    return life;
  }
  if (life.education.majorId !== null && !life.education.graduated) {
    return life;
  }

  return {
    ...life,
    character: { ...life.character, money: life.character.money - program.tuition },
    education: {
      level: program.level === 'secondary' ? life.education.level : program.level,
      majorId: program.id,
      grade: 0,
      stress: clampAttribute(life.education.stress + 8),
      graduated: false,
    },
  };
}

export function settleEducationYear(life: LifeStateV2): LifeStateV2 {
  if (life.education.majorId === null || life.education.graduated) {
    return life;
  }
  const program = educationPrograms.find((item) => item.id === life.education.majorId);
  if (program === undefined) {
    return life;
  }

  const nextGrade = life.education.grade + 1;
  const graduated = nextGrade >= program.durationYears;
  return {
    ...life,
    education: {
      ...life.education,
      grade: nextGrade,
      stress: graduated ? clampAttribute(life.education.stress - 15) : clampAttribute(life.education.stress + 4),
      graduated,
    },
  };
}
