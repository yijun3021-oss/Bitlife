import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ageUp, createNewLife } from '../game/engine';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { migrateLifeState } from '../game/migrations';
import type { LifeState } from '../game/types';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('life store', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and persists a single life', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });

    expect(useLifeStore.getState().life?.character.name).toBe('Mina Lin');
    expect(localStorage.getItem(SAVE_KEY)).toContain('Mina Lin');
  });

  it('ages up the current life', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });
    const currentLife = useLifeStore.getState().life;
    if (currentLife === null) {
      throw new Error('Expected a life to be created');
    }
    useLifeStore.setState({ life: { ...currentLife, currentEvent: null } });

    useLifeStore.getState().ageUpLife();

    expect(useLifeStore.getState().life?.character.age).toBe(1);
  });

  it('does not age up or save while a yearly event is unresolved', () => {
    const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }));
    useLifeStore.setState({ life, activeTab: 'activities' });

    useLifeStore.getState().ageUpLife();

    expect(useLifeStore.getState().life).toBe(life);
    expect(useLifeStore.getState().activeTab).toBe('activities');
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('loads a saved life and locale', () => {
    const savedLife = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'en-US',
      seed: 12,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('en-US');
    expect(useLifeStore.getState().life).toBeNull();
    expect(useLifeStore.getState().savedLife?.character.name).toBe('Mina Lin');
  });

  it('loads saved lives with P1 relationship kinds', () => {
    const savedLife: LifeState = {
      ...createNewLife({
        name: 'Mina Lin',
        gender: 'female',
        countryId: 'cn',
        locale: 'en-US',
        seed: 12,
      }),
      relationships: [
        { id: 'rel_friend', name: 'Alex Park', type: 'friend', closeness: 60, alive: true },
        { id: 'rel_partner', name: 'Taylor Kim', type: 'partner', closeness: 80, alive: true },
        { id: 'rel_spouse', name: 'Jordan Lin', type: 'spouse', closeness: 85, alive: true },
        { id: 'rel_ex', name: 'Casey Wu', type: 'ex', closeness: 30, alive: true },
        { id: 'rel_child', name: 'Mia Lin', type: 'child', closeness: 70, alive: true },
      ],
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().savedLife?.relationships.map((relationship) => relationship.type)).toEqual([
      'friend',
      'partner',
      'spouse',
      'ex',
      'child',
    ]);
  });

  it('continues a loaded saved life on demand', () => {
    const savedLife = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'en-US',
      seed: 12,
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();
    useLifeStore.getState().continueLife();

    expect(useLifeStore.getState().life?.character.name).toBe('Mina Lin');
    expect(useLifeStore.getState().activeTab).toBe('life');
  });

  it('normalizes legacy saved lives that do not have yearly activity usage', () => {
    const savedLife = createNewLife({
      name: 'Mina Lin',
      gender: 'female',
      countryId: 'cn',
      locale: 'en-US',
      seed: 12,
    });
    const legacyLife = { ...savedLife } as Record<string, unknown>;
    delete legacyLife.usedActivitiesThisAge;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: legacyLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().savedLife?.usedActivitiesThisAge).toEqual([]);
  });

  it('ignores invalid saved data when loading', () => {
    localStorage.setItem(SAVE_KEY, '{bad json');

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores invalid saved life shapes when loading', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 1,
        locale: 'en-US',
        life: { version: 1, character: { age: 'not-a-number', alive: true } },
      }),
    );

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives missing core fields', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 1,
        locale: 'en-US',
        life: {
          version: 1,
          locale: 'en-US',
          character: {
            id: 'life_incomplete',
            name: 'Mina Lin',
            gender: 'female',
            countryId: 'cn',
            age: 0,
            alive: true,
            money: 0,
          },
        },
      }),
    );

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with malformed current events', () => {
    const savedLife = {
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 }),
      currentEvent: {},
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with malformed relationships', () => {
    const savedLife = {
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 }),
      relationships: [{}],
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with null choice attributes effects', () => {
    const savedLife = lifeWithChoiceEffects({ attributes: null });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with malformed choice attribute values', () => {
    const savedLife = lifeWithChoiceEffects({ attributes: { happiness: 'bad' } });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with null choice relationship effects', () => {
    const savedLife = lifeWithChoiceEffects({ relationship: null });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with non-string statuses', () => {
    const savedLife = {
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 }),
      statuses: ['rested', 12],
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with non-string event tags', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 });
    const currentEvent = life.currentEvent;
    if (currentEvent === null) {
      throw new Error('Expected seed to create a current event');
    }
    const savedLife = {
      ...life,
      currentEvent: {
        ...currentEvent,
        tags: ['birth', 12],
      },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('ignores saved lives with non-string-or-number log values', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 });
    const savedLife = {
      ...life,
      log: [
        {
          ...life.log[0],
          values: { name: { nested: 'bad' } },
        },
      ],
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    useLifeStore.getState().loadLife();

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('persists locale and updates an existing life locale', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });

    useLifeStore.getState().setLocale('en-US');

    expect(useLifeStore.getState().locale).toBe('en-US');
    expect(useLifeStore.getState().life?.locale).toBe('en-US');
    expect(localStorage.getItem(SAVE_KEY)).toContain('en-US');
  });

  it('updates the active tab', () => {
    useLifeStore.getState().setActiveTab('activities');

    expect(useLifeStore.getState().activeTab).toBe('activities');
  });

  it('applies relationship interactions to a specific family member', () => {
    const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 }));
    const mother = life.relationships.find((relationship) => relationship.type === 'mother');
    if (mother === undefined) {
      throw new Error('Expected mother relationship');
    }
    useLifeStore.setState({ locale: 'en-US', life });

    useLifeStore.getState().interactRelationship(mother.id, 'talk');

    const updatedMother = useLifeStore.getState().life?.relationships.find((relationship) => relationship.id === mother.id);
    expect(updatedMother?.closeness).toBeGreaterThan(mother.closeness);
    expect(useLifeStore.getState().life?.log[0].textKey).toBe('log.relationshipInteraction');
  });

  it('clears the current life and persisted save', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });

    useLifeStore.getState().clearLife();

    expect(useLifeStore.getState().life).toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not throw when storage writes or removes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full');
    });

    expect(() => {
      useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn' });
    }).not.toThrow();
    expect(useLifeStore.getState().life?.character.name).toBe('Mina Lin');

    vi.restoreAllMocks();
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    expect(() => {
      useLifeStore.getState().clearLife();
    }).not.toThrow();
    expect(useLifeStore.getState().life).toBeNull();
  });

  it('runs find job activity through engine behavior for an eligible adult', () => {
    const adult = migrateLifeState(ageUpTo(
      createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      18,
    ));
    useLifeStore.setState({ life: adult });

    useLifeStore.getState().runActivity('find_job');

    expect(useLifeStore.getState().life?.job?.jobId).toBe('support_agent');
    expect(localStorage.getItem(SAVE_KEY)).toContain('support_agent');
  });

  it('prevents once-per-year activities until the life ages up', () => {
    const life = migrateLifeState({
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      currentEvent: null,
    });
    useLifeStore.setState({ life });

    useLifeStore.getState().runActivity('rest');
    const afterFirstRest = useLifeStore.getState().life;
    useLifeStore.getState().runActivity('rest');
    const afterSecondRest = useLifeStore.getState().life;
    useLifeStore.getState().ageUpLife();
    useLifeStore.getState().runActivity('rest');

    expect(afterFirstRest?.usedActivitiesThisAge).toEqual(['rest']);
    expect(afterSecondRest).toBe(afterFirstRest);
    expect(useLifeStore.getState().life?.character.age).toBe(1);
    expect(useLifeStore.getState().life?.usedActivitiesThisAge).toEqual(['rest']);
  });

  it('does not write a save for invalid activity ids or underage find job', () => {
    const infant = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }));
    useLifeStore.setState({ life: infant });

    useLifeStore.getState().runActivity('missing_activity');
    useLifeStore.getState().runActivity('find_job');

    expect(useLifeStore.getState().life).toBe(infant);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not write a save for invalid choices or missing current events', () => {
    const life = migrateLifeState({
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      currentEvent: null,
    });
    useLifeStore.setState({ life });

    useLifeStore.getState().chooseEvent('missing_choice');

    expect(useLifeStore.getState().life).toBe(life);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not age up, retab, or save an already dead life', () => {
    const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }));
    const deadLife: LifeStateV2 = {
      ...life,
      character: {
        ...life.character,
        alive: false,
      },
      currentEvent: null,
    };
    useLifeStore.setState({ life: deadLife, activeTab: 'activities' });

    useLifeStore.getState().ageUpLife();

    expect(useLifeStore.getState().life).toBe(deadLife);
    expect(useLifeStore.getState().activeTab).toBe('activities');
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });
});

function ageUpTo(life: LifeState, targetAge: number): LifeState {
  return Array.from({ length: targetAge }).reduce<LifeState>(
    (state, _, index) => ageUp({ ...state, currentEvent: null }, `store-age-${index}`),
    life,
  );
}

function lifeWithChoiceEffects(effects: unknown): LifeState {
  const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'en-US', seed: 12 });
  const currentEvent = life.currentEvent;
  if (currentEvent === null) {
    throw new Error('Expected seed to create a current event');
  }

  return {
    ...life,
    currentEvent: {
      ...currentEvent,
      choices: [
        {
          ...currentEvent.choices[0],
          effects,
        },
      ],
    },
  } as LifeState;
}
