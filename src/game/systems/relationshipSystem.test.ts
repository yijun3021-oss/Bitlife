import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { addRelationship, askOnDate, settleRelationshipYear } from './relationshipSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 12 }));
  return { ...life, character: { ...life.character, age: 24 } };
};

describe('relationshipSystem', () => {
  it('adds a friend relationship with a stable id', () => {
    const result = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 45 });
    expect(result.relationships).toContainEqual({ id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 45, alive: true });
  });

  it('turns a close friend into a partner when dating succeeds', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 80 });
    const result = askOnDate(withFriend, 'rel_alex');
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.type).toBe('partner');
  });

  it('does not date a low closeness friend', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 20 });
    expect(askOnDate(withFriend, 'rel_alex')).toBe(withFriend);
  });

  it('drifts relationship closeness during yearly settlement', () => {
    const withFriend = addRelationship(adultLife(), { id: 'rel_alex', name: 'Alex Park', type: 'friend', closeness: 80 });
    const result = settleRelationshipYear(withFriend);
    expect(result.relationships.find((item) => item.id === 'rel_alex')?.closeness).toBe(78);
  });
});
