import { create } from 'zustand';
import { activities } from '../content/activities';
import { ageUp, applyActivity, applyChoice, createNewLife, findJob } from '../game/engine';
import type { Gender, LifeState, Locale } from '../game/types';

export const SAVE_KEY = 'bitliffe.save.v1';

type ActiveTab = 'life' | 'relationships' | 'schoolWork' | 'activities' | 'profile';

interface SaveRecord {
  version: 1;
  locale: Locale;
  life: LifeState | null;
}

interface CreateLifeInput {
  name: string;
  gender: Gender;
  countryId: string;
}

interface LifeStoreState {
  locale: Locale;
  life: LifeState | null;
  activeTab: ActiveTab;
  createLife: (input: CreateLifeInput) => void;
  loadLife: () => void;
  clearLife: () => void;
  setLocale: (locale: Locale) => void;
  setActiveTab: (tab: ActiveTab) => void;
  ageUpLife: () => void;
  chooseEvent: (choiceId: string) => void;
  runActivity: (activityId: string) => void;
}

export const useLifeStore = create<LifeStoreState>((set, get) => ({
  locale: 'zh-CN',
  life: null,
  activeTab: 'life',

  createLife: (input) => {
    const life = createNewLife({
      ...input,
      locale: get().locale,
      seed: Date.now() % 100000,
    });
    set({ life, activeTab: 'life' });
    writeSave(get().locale, life);
  },

  loadLife: () => {
    const save = readSave();
    if (save === null) {
      return;
    }
    set({ locale: save.locale, life: save.life });
  },

  clearLife: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ life: null, activeTab: 'life' });
  },

  setLocale: (locale) => {
    const currentLife = get().life;
    const life = currentLife === null ? null : { ...currentLife, locale };
    set({ locale, life });
    writeSave(locale, life);
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  ageUpLife: () => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }
    const life = ageUp(currentLife, Date.now() % 100000);
    set({ life, activeTab: life.character.alive ? 'life' : 'profile' });
    writeSave(get().locale, life);
  },

  chooseEvent: (choiceId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }
    const life = applyChoice(currentLife, choiceId);
    set({ life });
    writeSave(get().locale, life);
  },

  runActivity: (activityId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    if (activityId === 'find_job') {
      const life = findJob(currentLife);
      set({ life });
      writeSave(get().locale, life);
      return;
    }

    const activity = activities.find((item) => item.id === activityId);
    if (activity === undefined || currentLife.character.age < activity.minAge) {
      return;
    }

    const life = applyActivity(currentLife, activity.effects);
    set({ life });
    writeSave(get().locale, life);
  },
}));

function readSave(): SaveRecord | null {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);
    if (rawSave === null) {
      return null;
    }

    const save = JSON.parse(rawSave) as Partial<SaveRecord>;
    if (save.version !== 1 || !isLocale(save.locale)) {
      return null;
    }

    return {
      version: 1,
      locale: save.locale,
      life: save.life ?? null,
    };
  } catch {
    return null;
  }
}

function writeSave(locale: Locale, life: LifeState | null): void {
  const save: SaveRecord = { version: 1, locale, life };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function isLocale(value: unknown): value is Locale {
  return value === 'zh-CN' || value === 'en-US';
}
