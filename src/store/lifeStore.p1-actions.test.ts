import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_KEY, useLifeStore } from './lifeStore';

describe('p1 store actions', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
    useLifeStore.getState().setLocale('en-US');
    useLifeStore.getState().createLife({ name: 'Mina Lin', gender: 'female', countryId: 'us' });
    useLifeStore.setState((state) => ({
      life: state.life === null
        ? null
        : {
          ...state.life,
          character: {
            ...state.life.character,
            age: 25,
            money: 100000,
            attributes: { ...state.life.character.attributes, smarts: 80 },
          },
        },
    }));
  });

  it('applies education and career actions through the store', () => {
    useLifeStore.getState().enrollInProgram('education.university');
    expect(useLifeStore.getState().life?.education.majorId).toBe('education.university');
    useLifeStore.setState((state) => ({
      life: state.life === null
        ? null
        : { ...state.life, education: { ...state.life.education, level: 'university', graduated: true } },
    }));
    useLifeStore.getState().applyForCareer('career.software_analyst');
    expect(useLifeStore.getState().life?.career.currentJobId).toBe('career.software_analyst');
  });

  it('applies assets, health, crime, and prison actions through the store', () => {
    useLifeStore.getState().buyAsset('asset.used_compact');
    expect(useLifeStore.getState().life?.assets.length).toBe(1);
    useLifeStore.getState().contractDisease('disease.common_cold');
    expect(useLifeStore.getState().life?.health.diseases).toContain('disease.common_cold');
    useLifeStore.getState().attemptCrime('crime.bank_robbery', 0.99);
    expect(useLifeStore.getState().life?.prison.incarcerated).toBe(true);
    useLifeStore.getState().attemptAppeal(0.99);
    expect(useLifeStore.getState().life?.prison.incarcerated).toBe(false);
  });
});
