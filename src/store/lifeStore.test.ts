import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ageUp, createNewLife } from '../game/engine';
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
    useLifeStore.getState().ageUpLife();

    expect(useLifeStore.getState().life?.character.age).toBe(1);
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
    expect(useLifeStore.getState().life?.character.name).toBe('Mina Lin');
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
    const adult = ageUpTo(
      createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      18,
    );
    useLifeStore.setState({ life: adult });

    useLifeStore.getState().runActivity('find_job');

    expect(useLifeStore.getState().life?.job?.jobId).toBe('support_agent');
    expect(localStorage.getItem(SAVE_KEY)).toContain('support_agent');
  });

  it('does not write a save for invalid activity ids or underage find job', () => {
    const infant = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    useLifeStore.setState({ life: infant });

    useLifeStore.getState().runActivity('missing_activity');
    useLifeStore.getState().runActivity('find_job');

    expect(useLifeStore.getState().life).toBe(infant);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not write a save for invalid choices or missing current events', () => {
    const life = {
      ...createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 }),
      currentEvent: null,
    };
    useLifeStore.setState({ life });

    useLifeStore.getState().chooseEvent('missing_choice');

    expect(useLifeStore.getState().life).toBe(life);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not age up, retab, or save an already dead life', () => {
    const life = createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'cn', locale: 'zh-CN', seed: 12 });
    const deadLife: LifeState = {
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
