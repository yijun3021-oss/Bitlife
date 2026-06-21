import { beforeEach, describe, expect, it } from 'vitest';
import { createNewLife } from '../game/engine';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { SAVE_KEY, useLifeStore } from './lifeStore';

function savedV1Json() {
  const life = createNewLife({ name: 'Saved Person', gender: 'female', countryId: 'us', locale: 'en-US', seed: 111 });
  return JSON.stringify({ version: 1, locale: 'en-US', life });
}

describe('p1 store migration', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates new active lives as LifeStateV2', () => {
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'us' });
    const life: LifeStateV2 | null = useLifeStore.getState().life;
    expect(life?.version).toBe(2);
    expect(life?.career.currentJobId).toBeNull();
  });

  it('migrates loaded saved lives before continueLife exposes them as active', () => {
    localStorage.setItem(SAVE_KEY, savedV1Json());
    useLifeStore.getState().loadLife();
    expect(useLifeStore.getState().savedLife?.version).toBe(2);
    useLifeStore.getState().continueLife();
    const life: LifeStateV2 | null = useLifeStore.getState().life;
    expect(life?.version).toBe(2);
    expect(life?.assets).toEqual([]);
  });
});
