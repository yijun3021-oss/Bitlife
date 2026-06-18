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
    removeSave();
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
    updateLife(currentLife, life, get().locale, set, { activeTab: life.character.alive ? 'life' : 'profile' });
  },

  chooseEvent: (choiceId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }
    const life = applyChoice(currentLife, choiceId);
    updateLife(currentLife, life, get().locale, set);
  },

  runActivity: (activityId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const activity = activities.find((item) => item.id === activityId);
    if (activity === undefined || currentLife.character.age < activity.minAge) {
      return;
    }

    if (activityId === 'find_job') {
      const life = findJob(currentLife);
      updateLife(currentLife, life, get().locale, set);
      return;
    }

    const life = applyActivity(currentLife, activity.effects);
    updateLife(currentLife, life, get().locale, set);
  },
}));

function readSave(): SaveRecord | null {
  try {
    const rawSave = localStorage.getItem(SAVE_KEY);
    if (rawSave === null) {
      return null;
    }

    const save = JSON.parse(rawSave) as Partial<SaveRecord>;
    if (save.version !== 1 || !isLocale(save.locale) || !isSavedLife(save.life)) {
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
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Storage can be unavailable or full; app state should still update.
  }
}

function removeSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Storage can be unavailable; clearing in-memory state should still work.
  }
}

function updateLife(
  currentLife: LifeState,
  life: LifeState,
  locale: Locale,
  set: (partial: Partial<LifeStoreState>) => void,
  extraState: Partial<Pick<LifeStoreState, 'activeTab'>> = {},
): void {
  if (life === currentLife) {
    return;
  }

  set({ life, ...extraState });
  writeSave(locale, life);
}

function isLocale(value: unknown): value is Locale {
  return value === 'zh-CN' || value === 'en-US';
}

function isSavedLife(value: unknown): value is LifeState | null {
  if (value === null || value === undefined) {
    return value === null;
  }
  if (typeof value !== 'object') {
    return false;
  }

  const maybeLife = value as Partial<LifeState>;
  return (
    maybeLife.version === 1 &&
    isLocale(maybeLife.locale) &&
    isSavedCharacter(maybeLife.character) &&
    Array.isArray(maybeLife.relationships) &&
    isSavedSchool(maybeLife.school) &&
    isSavedJob(maybeLife.job) &&
    Array.isArray(maybeLife.statuses) &&
    (maybeLife.currentEvent === null || isPlainObject(maybeLife.currentEvent)) &&
    Array.isArray(maybeLife.log) &&
    (maybeLife.deathSummary === null || isPlainObject(maybeLife.deathSummary))
  );
}

function isSavedCharacter(value: unknown): value is LifeState['character'] {
  if (!isPlainObject(value)) {
    return false;
  }

  const character = value as Partial<LifeState['character']>;
  return (
    typeof character.id === 'string' &&
    typeof character.name === 'string' &&
    isGender(character.gender) &&
    typeof character.countryId === 'string' &&
    typeof character.age === 'number' &&
    typeof character.alive === 'boolean' &&
    typeof character.money === 'number' &&
    isSavedAttributes(character.attributes)
  );
}

function isSavedAttributes(value: unknown): value is LifeState['character']['attributes'] {
  if (!isPlainObject(value)) {
    return false;
  }

  const attributes = value as Partial<LifeState['character']['attributes']>;
  return (
    typeof attributes.happiness === 'number' &&
    typeof attributes.health === 'number' &&
    typeof attributes.smarts === 'number' &&
    typeof attributes.looks === 'number'
  );
}

function isSavedSchool(value: unknown): value is LifeState['school'] {
  if (!isPlainObject(value)) {
    return false;
  }

  const school = value as Partial<LifeState['school']>;
  return (
    typeof school.stage === 'string' &&
    typeof school.grade === 'number' &&
    typeof school.stress === 'number'
  );
}

function isSavedJob(value: unknown): value is LifeState['job'] {
  if (value === null) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  const job = value;
  return (
    typeof job.jobId === 'string' &&
    typeof job.titleKey === 'string' &&
    typeof job.salary === 'number' &&
    typeof job.years === 'number'
  );
}

function isGender(value: unknown): value is Gender {
  return value === 'female' || value === 'male' || value === 'non_binary';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
