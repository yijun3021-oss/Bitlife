import { beforeEach, describe, expect, it } from 'vitest';
import { ageUp, createNewLife } from '../game/engine';
import type { LifeState } from '../game/types';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('life store', () => {
  beforeEach(() => {
    localStorage.clear();
    useLifeStore.setState(useLifeStore.getInitialState(), true);
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
});

function ageUpTo(life: LifeState, targetAge: number): LifeState {
  return Array.from({ length: targetAge }).reduce<LifeState>(
    (state, _, index) => ageUp({ ...state, currentEvent: null }, `store-age-${index}`),
    life,
  );
}
