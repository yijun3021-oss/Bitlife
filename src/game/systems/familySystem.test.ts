import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { addRelationship } from './relationshipSystem';
import { adoptChild, divorceSpouse, marryPartner, settleFamilyYear } from './familySystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 21 }));
  return { ...life, character: { ...life.character, age: 30, money: 50000 } };
};

describe('familySystem', () => {
  it('marries a partner and stores spouse id', () => {
    const withPartner = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'partner', closeness: 82 });
    const result = marryPartner(withPartner, 'rel_alex');
    expect(result.family.spouseId).toBe('rel_alex');
    expect(result.family.marriageCount).toBe(1);
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.type).toBe('spouse');
  });

  it('divorces the active spouse', () => {
    const married = marryPartner(addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'partner', closeness: 82 }), 'rel_alex');
    const result = divorceSpouse(married);
    expect(result.family.spouseId).toBeNull();
    expect(result.family.divorceCount).toBe(1);
  });

  it('adopts a child when adult and solvent', () => {
    const result = adoptChild(adultLife(), { id: 'rel_child_mia', name: 'Mia Lin' });
    expect(result.family.childrenIds).toEqual(['rel_child_mia']);
    expect(result.family.adoptionCount).toBe(1);
    expect(result.character.money).toBe(35000);
  });

  it('rejects adoption when the child id already belongs to another relationship', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 60 });
    const result = adoptChild(withFriend, { id: 'rel_alex', name: 'Alex Park' });
    expect(result).toBe(withFriend);
    expect(result.relationships).toHaveLength(withFriend.relationships.length);
    expect(result.family.childrenIds).toEqual([]);
    expect(result.family.adoptionCount).toBe(0);
    expect(result.character.money).toBe(50000);
  });

  it('settles family year without removing children', () => {
    const family = adoptChild(adultLife(), { id: 'rel_child_mia', name: 'Mia Lin' });
    expect(settleFamilyYear(family).family.childrenIds).toEqual(['rel_child_mia']);
  });
});
