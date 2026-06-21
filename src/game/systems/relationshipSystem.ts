import { clampAttribute } from '../attributes';
import type { LifeStateV2 } from '../lifeStateV2';
import type { Relationship, RelationshipKind } from '../types';

export interface AddRelationshipInput {
  id: string;
  name: string;
  type: RelationshipKind;
  closeness: number;
}

export function addRelationship(life: LifeStateV2, input: AddRelationshipInput): LifeStateV2 {
  if (life.relationships.some((item) => item.id === input.id)) {
    return life;
  }

  const relationship: Relationship = {
    id: input.id,
    name: input.name,
    type: input.type,
    closeness: clampAttribute(input.closeness),
    alive: true,
  };

  return { ...life, relationships: [...life.relationships, relationship] };
}

export function askOnDate(life: LifeStateV2, relationshipId: string): LifeStateV2 {
  const relationship = life.relationships.find((item) => item.id === relationshipId);
  if (relationship === undefined || relationship.type !== 'friend' || relationship.closeness < 70) {
    return life;
  }

  return {
    ...life,
    relationships: life.relationships.map((item) =>
      item.id === relationshipId ? { ...item, type: 'partner', closeness: clampAttribute(item.closeness + 5) } : item,
    ),
  };
}

export function settleRelationshipYear(life: LifeStateV2): LifeStateV2 {
  return {
    ...life,
    relationships: life.relationships.map((item) => ({
      ...item,
      closeness: clampAttribute(item.closeness + (item.type === 'partner' || item.type === 'spouse' ? -1 : -2)),
    })),
  };
}
