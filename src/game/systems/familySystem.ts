import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';

export function marryPartner(life: LifeStateV2, relationshipId: string): LifeStateV2 {
  const partner = life.relationships.find((item) => item.id === relationshipId);
  if (partner === undefined || partner.type !== 'partner' || partner.closeness < 75 || life.family.spouseId !== null) {
    return life;
  }

  return {
    ...life,
    family: { ...life.family, spouseId: relationshipId, marriageCount: life.family.marriageCount + 1 },
    relationships: life.relationships.map((item) => (item.id === relationshipId ? { ...item, type: 'spouse' } : item)),
  };
}

export function divorceSpouse(life: LifeStateV2): LifeStateV2 {
  if (life.family.spouseId === null) {
    return life;
  }

  const spouseId = life.family.spouseId;
  return {
    ...life,
    family: { ...life.family, spouseId: null, divorceCount: life.family.divorceCount + 1 },
    relationships: life.relationships.map((item) =>
      item.id === spouseId ? { ...item, type: 'ex', closeness: clampAttribute(item.closeness - 35) } : item,
    ),
  };
}

export function adoptChild(life: LifeStateV2, child: { id: string; name: string }): LifeStateV2 {
  if (life.character.age < 21 || life.character.money < 15000 || life.family.childrenIds.includes(child.id)) {
    return life;
  }

  return {
    ...life,
    character: { ...life.character, money: life.character.money - 15000 },
    family: {
      ...life.family,
      childrenIds: [...life.family.childrenIds, child.id],
      adoptionCount: life.family.adoptionCount + 1,
    },
    relationships: [...life.relationships, { id: child.id, name: child.name, type: 'child', closeness: 70, alive: true }],
  };
}

export function settleFamilyYear(life: LifeStateV2): LifeStateV2 {
  return life;
}
