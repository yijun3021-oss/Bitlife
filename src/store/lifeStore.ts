import { create } from 'zustand';
import { activities } from '../content/activities';
import { careers } from '../content/catalog/careers';
import {
  ageUp,
  applyActivity,
  applyChoice,
  createNewLife,
  findJob,
  interactWithRelationship,
} from '../game/engine';
import type { LicenseKind, LifeStateV2 } from '../game/lifeStateV2';
import { migrateLifeState } from '../game/migrations';
import {
  buyAsset as buyAssetSystem,
  obtainLicense as obtainLicenseSystem,
  sellAsset as sellAssetSystem,
} from '../game/systems/assetSystem';
import { applyForCareer as applyForCareerSystem } from '../game/systems/careerSystem';
import { attemptCrime as attemptCrimeSystem } from '../game/systems/crimeSystem';
import { enrollInProgram as enrollInProgramSystem } from '../game/systems/educationSystem';
import {
  adoptChild as adoptChildSystem,
  divorceSpouse as divorceSpouseSystem,
  marryPartner as marryPartnerSystem,
} from '../game/systems/familySystem';
import { contractDisease as contractDiseaseSystem, treatDisease as treatDiseaseSystem } from '../game/systems/healthSystem';
import { attemptAppeal as attemptAppealSystem } from '../game/systems/prisonSystem';
import { addRelationship as addRelationshipSystem, askOnDate as askOnDateSystem } from '../game/systems/relationshipSystem';
import type { Gender, LifeState, Locale, RelationshipActionId, RelationshipKind } from '../game/types';

export const SAVE_KEY = 'bitliffe.save.v1';

export type ActiveTab = 'life' | 'relationships' | 'schoolWork' | 'activities' | 'profile';

interface SaveRecord {
  version: 1;
  locale: Locale;
  life: LifeState | LifeStateV2 | null;
}

interface LoadedSaveRecord {
  version: 1;
  locale: Locale;
  life: LifeStateV2 | null;
}

interface CreateLifeInput {
  name: string;
  gender: Gender;
  countryId: string;
}

interface LifeStoreState {
  locale: Locale;
  life: LifeStateV2 | null;
  savedLife: LifeStateV2 | null;
  activeTab: ActiveTab;
  createLife: (input: CreateLifeInput) => void;
  loadLife: () => void;
  continueLife: () => void;
  clearLife: () => void;
  setLocale: (locale: Locale) => void;
  setActiveTab: (tab: ActiveTab) => void;
  ageUpLife: () => void;
  chooseEvent: (choiceId: string) => void;
  runActivity: (activityId: string) => void;
  chooseJob: (jobId: string) => void;
  interactRelationship: (relationshipId: string, actionId: RelationshipActionId) => void;
  enrollInProgram: (programId: string) => void;
  applyForCareer: (careerId: string) => void;
  addRelationship: (input: { id: string; name: string; type: RelationshipKind; closeness: number }) => void;
  askOnDate: (relationshipId: string) => void;
  marryPartner: (relationshipId: string) => void;
  divorceSpouse: () => void;
  adoptChild: (child: { id: string; name: string }) => void;
  buyAsset: (assetCatalogId: string) => void;
  sellAsset: (ownedAssetId: string) => void;
  obtainLicense: (license: LicenseKind) => void;
  contractDisease: (diseaseId: string) => void;
  treatDisease: (diseaseId: string, treatmentId: string) => void;
  attemptCrime: (crimeId: string, roll?: number) => void;
  attemptAppeal: (roll?: number) => void;
}

export const useLifeStore = create<LifeStoreState>((set, get) => ({
  locale: 'zh-CN',
  life: null,
  savedLife: null,
  activeTab: 'life',

  createLife: (input) => {
    const life = migrateLifeState(createNewLife({
      ...input,
      locale: get().locale,
      seed: Date.now() % 100000,
    }));
    set({ life, savedLife: null, activeTab: 'life' });
    writeSave(get().locale, life);
  },

  loadLife: () => {
    const save = readSave();
    if (save === null) {
      return;
    }
    set({ locale: save.locale, life: null, savedLife: save.life });
  },

  continueLife: () => {
    const savedLife = get().savedLife;
    if (savedLife === null) {
      return;
    }
    const life = migrateLifeState(savedLife);
    set({ life, savedLife: null, activeTab: 'life' });
    writeSave(get().locale, life);
  },

  clearLife: () => {
    removeSave();
    set({ life: null, savedLife: null, activeTab: 'life' });
  },

  setLocale: (locale) => {
    const currentLife = get().life;
    const currentSavedLife = get().savedLife;
    const life = currentLife === null ? null : { ...currentLife, locale };
    const savedLife = currentSavedLife === null ? null : { ...currentSavedLife, locale };
    set({ locale, life, savedLife });
    writeSave(locale, life ?? savedLife);
  },

  setActiveTab: (activeTab) => {
    set({ activeTab });
  },

  ageUpLife: () => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }
    const life = normalizeActionResult(currentLife, ageUp(currentLife, Date.now() % 100000));
    updateLife(currentLife, life, get().locale, set, { activeTab: life.character.alive ? 'life' : 'profile' });
  },

  chooseEvent: (choiceId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }
    const life = normalizeActionResult(currentLife, applyChoice(currentLife as unknown as LifeState, choiceId));
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

    if (activity.oncePerAge === true && currentLife.usedActivitiesThisAge.includes(activity.id)) {
      return;
    }

    if (activity.cost > currentLife.character.money) {
      return;
    }

    if (activityId === 'find_job') {
      const life = bridgeLegacyJobToP1Career(currentLife);
      updateLife(currentLife, life, get().locale, set);
      return;
    }

    const life = normalizeActionResult(
      currentLife,
      applyActivity(
        currentLife as unknown as LifeState,
        activity.effects,
        activity.resultKey,
        activity.oncePerAge === true ? activity.id : undefined,
      ),
    );
    updateLife(currentLife, life, get().locale, set);
  },

  chooseJob: (jobId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = bridgeLegacyJobToP1Career(currentLife, jobId);
    updateLife(currentLife, life, get().locale, set);
  },

  interactRelationship: (relationshipId, actionId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = normalizeActionResult(
      currentLife,
      interactWithRelationship(currentLife as unknown as LifeState, relationshipId, actionId),
    );
    updateLife(currentLife, life, get().locale, set);
  },

  enrollInProgram: (programId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = enrollInProgramSystem(currentLife, programId);
    updateLife(currentLife, life, get().locale, set);
  },

  applyForCareer: (careerId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = applyForCareerSystem(currentLife, careerId);
    updateLife(currentLife, life, get().locale, set);
  },

  addRelationship: (input) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = addRelationshipSystem(currentLife, input);
    updateLife(currentLife, life, get().locale, set);
  },

  askOnDate: (relationshipId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = askOnDateSystem(currentLife, relationshipId);
    updateLife(currentLife, life, get().locale, set);
  },

  marryPartner: (relationshipId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = marryPartnerSystem(currentLife, relationshipId);
    updateLife(currentLife, life, get().locale, set);
  },

  divorceSpouse: () => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = divorceSpouseSystem(currentLife);
    updateLife(currentLife, life, get().locale, set);
  },

  adoptChild: (child) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = adoptChildSystem(currentLife, child);
    updateLife(currentLife, life, get().locale, set);
  },

  buyAsset: (assetCatalogId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = buyAssetSystem(currentLife, assetCatalogId);
    updateLife(currentLife, life, get().locale, set);
  },

  sellAsset: (ownedAssetId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = sellAssetSystem(currentLife, ownedAssetId);
    updateLife(currentLife, life, get().locale, set);
  },

  obtainLicense: (license) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = obtainLicenseSystem(currentLife, license);
    updateLife(currentLife, life, get().locale, set);
  },

  contractDisease: (diseaseId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = contractDiseaseSystem(currentLife, diseaseId);
    updateLife(currentLife, life, get().locale, set);
  },

  treatDisease: (diseaseId, treatmentId) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = treatDiseaseSystem(currentLife, diseaseId, treatmentId);
    updateLife(currentLife, life, get().locale, set);
  },

  attemptCrime: (crimeId, roll = Math.random()) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = attemptCrimeSystem(currentLife, crimeId, roll);
    updateLife(currentLife, life, get().locale, set);
  },

  attemptAppeal: (roll = Math.random()) => {
    const currentLife = get().life;
    if (currentLife === null) {
      return;
    }

    const life = attemptAppealSystem(currentLife, roll);
    updateLife(currentLife, life, get().locale, set);
  },
}));

function readSave(): LoadedSaveRecord | null {
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
      life: save.life === null ? null : normalizeLife(save.life),
    };
  } catch {
    return null;
  }
}

function writeSave(locale: Locale, life: LifeStateV2 | null): void {
  const normalizedLife = life === null ? null : migrateLifeState(life);
  const save: SaveRecord = { version: 1, locale, life: normalizedLife };
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
  currentLife: LifeStateV2,
  life: LifeStateV2,
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

function normalizeActionResult(currentLife: LifeStateV2, life: LifeState | LifeStateV2): LifeStateV2 {
  return life === currentLife ? currentLife : migrateLifeState(life);
}

function bridgeLegacyJobToP1Career(currentLife: LifeStateV2, jobId?: string): LifeStateV2 {
  const legacyInput = currentLife as unknown as LifeState;
  const legacyLife = findJob(legacyInput, jobId);
  if (legacyLife === legacyInput || legacyLife.job === null) {
    return currentLife;
  }

  const careerId = getP1CareerIdForLegacyJob(legacyLife.job.jobId);
  if (careerId === null) {
    return currentLife;
  }

  const careerLife = applyForCareerSystem(currentLife, careerId);
  if (careerLife === currentLife) {
    return currentLife;
  }

  return {
    ...careerLife,
    job: legacyLife.job,
    log: legacyLife.log,
  };
}

function getP1CareerIdForLegacyJob(jobId: string): string | null {
  const careerId = `career.${jobId}`;
  return careers.some((career) => career.id === careerId) ? careerId : null;
}

function isLocale(value: unknown): value is Locale {
  return value === 'zh-CN' || value === 'en-US';
}

function isSavedLife(value: unknown): value is LifeState | LifeStateV2 | null {
  if (value === null || value === undefined) {
    return value === null;
  }
  if (typeof value !== 'object') {
    return false;
  }

  const maybeLife = value as Partial<LifeState | LifeStateV2>;
  const version = maybeLife.version;
  return (
    (version === 1 || version === 2) &&
    isLocale(maybeLife.locale) &&
    isSavedCharacter(maybeLife.character) &&
    isSavedRelationships(maybeLife.relationships) &&
    isSavedSchool(maybeLife.school) &&
    isSavedJob(maybeLife.job) &&
    isStringArray(maybeLife.statuses) &&
    (maybeLife.usedActivitiesThisAge === undefined || isStringArray(maybeLife.usedActivitiesThisAge)) &&
    isSavedCurrentEvent(maybeLife.currentEvent) &&
    isSavedLog(maybeLife.log) &&
    isSavedDeathSummary(maybeLife.deathSummary) &&
    (version === 1 || isSavedP1Containers(maybeLife))
  );
}

function normalizeLife(life: LifeState | LifeStateV2): LifeStateV2 {
  const usedActivitiesThisAge = isStringArray(life.usedActivitiesThisAge) ? life.usedActivitiesThisAge : [];
  return migrateLifeState({
    ...life,
    usedActivitiesThisAge,
  });
}

function isSavedP1Containers(value: Partial<LifeState | LifeStateV2>): boolean {
  const maybeLife = value as Partial<LifeStateV2>;
  return (
    isSavedEducationV2(maybeLife.education) &&
    isSavedCareerV2(maybeLife.career) &&
    isSavedFamilyV2(maybeLife.family) &&
    isSavedAssetsV2(maybeLife.assets) &&
    isSavedLicensesV2(maybeLife.licenses) &&
    isSavedHealthV2(maybeLife.health) &&
    isSavedCriminalRecordV2(maybeLife.criminalRecord) &&
    isSavedPrisonV2(maybeLife.prison) &&
    isSavedAchievementsV2(maybeLife.achievements) &&
    isSavedStatsV2(maybeLife.stats)
  );
}

function isSavedEducationV2(value: unknown): value is LifeStateV2['education'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.level === 'string' &&
    isNullableString(value.majorId) &&
    typeof value.grade === 'number' &&
    typeof value.stress === 'number' &&
    typeof value.graduated === 'boolean'
  );
}

function isSavedCareerV2(value: unknown): value is LifeStateV2['career'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNullableString(value.currentJobId) &&
    typeof value.performance === 'number' &&
    typeof value.yearsInRole === 'number' &&
    typeof value.retired === 'boolean'
  );
}

function isSavedFamilyV2(value: unknown): value is LifeStateV2['family'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    isNullableString(value.spouseId) &&
    isStringArray(value.childrenIds) &&
    typeof value.marriageCount === 'number' &&
    typeof value.divorceCount === 'number' &&
    typeof value.adoptionCount === 'number'
  );
}

function isSavedAssetsV2(value: unknown): value is LifeStateV2['assets'] {
  return Array.isArray(value) && value.every(isSavedAssetV2);
}

function isSavedAssetV2(value: unknown): value is LifeStateV2['assets'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.catalogId === 'string' &&
    typeof value.value === 'number' &&
    typeof value.purchaseAge === 'number'
  );
}

function isSavedLicensesV2(value: unknown): value is LifeStateV2['licenses'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return typeof value.driving === 'boolean' && typeof value.boat === 'boolean' && typeof value.flight === 'boolean';
}

function isSavedHealthV2(value: unknown): value is LifeStateV2['health'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return isStringArray(value.diseases) && Array.isArray(value.treatmentHistory) && value.treatmentHistory.every(isSavedTreatmentRecord);
}

function isSavedTreatmentRecord(value: unknown): value is LifeStateV2['health']['treatmentHistory'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.diseaseId === 'string' &&
    typeof value.treatmentId === 'string' &&
    typeof value.age === 'number' &&
    typeof value.recovered === 'boolean'
  );
}

function isSavedCriminalRecordV2(value: unknown): value is LifeStateV2['criminalRecord'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return Array.isArray(value.arrests) && value.arrests.every(isSavedArrestRecord) &&
    Array.isArray(value.convictions) && value.convictions.every(isSavedConvictionRecord);
}

function isSavedArrestRecord(value: unknown): value is LifeStateV2['criminalRecord']['arrests'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  return typeof value.id === 'string' && typeof value.crimeId === 'string' && typeof value.age === 'number';
}

function isSavedConvictionRecord(value: unknown): value is LifeStateV2['criminalRecord']['convictions'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.crimeId === 'string' &&
    typeof value.age === 'number' &&
    typeof value.sentenceYears === 'number'
  );
}

function isSavedPrisonV2(value: unknown): value is LifeStateV2['prison'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.incarcerated === 'boolean' &&
    typeof value.remainingYears === 'number' &&
    typeof value.behavior === 'number' &&
    typeof value.appealAvailable === 'boolean' &&
    typeof value.paroleEligible === 'boolean'
  );
}

function isSavedAchievementsV2(value: unknown): value is LifeStateV2['achievements'] {
  return isPlainObject(value) && isStringArray(value.unlocked);
}

function isSavedStatsV2(value: unknown): value is LifeStateV2['stats'] {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.totalIncome === 'number' &&
    typeof value.workYears === 'number' &&
    typeof value.crimesSucceeded === 'number' &&
    typeof value.prisonYears === 'number' &&
    typeof value.diseasesRecovered === 'number'
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
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
    isSchoolStage(school.stage) &&
    typeof school.grade === 'number' &&
    typeof school.stress === 'number'
  );
}

function isSavedRelationships(value: unknown): value is LifeState['relationships'] {
  return Array.isArray(value) && value.every(isSavedRelationship);
}

function isSavedRelationship(value: unknown): value is LifeState['relationships'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  const relationship = value as Partial<LifeState['relationships'][number]>;
  return (
    typeof relationship.id === 'string' &&
    typeof relationship.name === 'string' &&
    isRelationshipKind(relationship.type) &&
    typeof relationship.closeness === 'number' &&
    typeof relationship.alive === 'boolean'
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

function isSavedCurrentEvent(value: unknown): value is LifeState['currentEvent'] {
  if (value === null) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  const event = value as Partial<NonNullable<LifeState['currentEvent']>>;
  return (
    typeof event.id === 'string' &&
    typeof event.textKey === 'string' &&
    typeof event.minAge === 'number' &&
    typeof event.maxAge === 'number' &&
    typeof event.weight === 'number' &&
    isStringArray(event.tags) &&
    Array.isArray(event.choices) &&
    event.choices.every(isSavedChoice)
  );
}

function isSavedChoice(value: unknown): value is NonNullable<LifeState['currentEvent']>['choices'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  const choice = value as Partial<NonNullable<LifeState['currentEvent']>['choices'][number]>;
  return (
    typeof choice.id === 'string' &&
    typeof choice.textKey === 'string' &&
    typeof choice.resultKey === 'string' &&
    isSavedEffects(choice.effects)
  );
}

function isSavedEffects(value: unknown): value is NonNullable<LifeState['currentEvent']>['choices'][number]['effects'] {
  if (!isPlainObject(value)) {
    return false;
  }

  const effects = value;
  return (
    isOptionalAttributesEffect(effects.attributes) &&
    (effects.money === undefined || typeof effects.money === 'number') &&
    isOptionalRelationshipEffect(effects.relationship) &&
    isOptionalSchoolEffect(effects.school) &&
    (effects.addStatus === undefined || typeof effects.addStatus === 'string') &&
    (effects.removeStatus === undefined || typeof effects.removeStatus === 'string')
  );
}

function isOptionalAttributesEffect(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    (value.happiness === undefined || typeof value.happiness === 'number') &&
    (value.health === undefined || typeof value.health === 'number') &&
    (value.smarts === undefined || typeof value.smarts === 'number') &&
    (value.looks === undefined || typeof value.looks === 'number')
  );
}

function isOptionalRelationshipEffect(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  return isRelationshipKind(value.type) && typeof value.closeness === 'number';
}

function isOptionalSchoolEffect(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  return value.stress === undefined || typeof value.stress === 'number';
}

function isSavedLog(value: unknown): value is LifeState['log'] {
  return Array.isArray(value) && value.every(isSavedLogEntry);
}

function isSavedLogEntry(value: unknown): value is LifeState['log'][number] {
  if (!isPlainObject(value)) {
    return false;
  }

  const logEntry = value as Partial<LifeState['log'][number]>;
  return (
    typeof logEntry.id === 'string' &&
    typeof logEntry.age === 'number' &&
    typeof logEntry.textKey === 'string' &&
    (logEntry.values === undefined || isSavedLogValues(logEntry.values))
  );
}

function isSavedDeathSummary(value: unknown): value is LifeState['deathSummary'] {
  if (value === null) {
    return true;
  }
  if (!isPlainObject(value)) {
    return false;
  }

  const deathSummary = value as Partial<NonNullable<LifeState['deathSummary']>>;
  return (
    typeof deathSummary.age === 'number' &&
    typeof deathSummary.causeKey === 'string' &&
    typeof deathSummary.netWorth === 'number' &&
    typeof deathSummary.logKey === 'string'
  );
}

function isSchoolStage(value: unknown): value is LifeState['school']['stage'] {
  return value === 'none' || value === 'elementary' || value === 'middle' || value === 'finished';
}

function isGender(value: unknown): value is Gender {
  return value === 'female' || value === 'male' || value === 'non_binary';
}

function isRelationshipKind(value: unknown): value is LifeState['relationships'][number]['type'] {
  return (
    value === 'mother' ||
    value === 'father' ||
    value === 'sibling' ||
    value === 'friend' ||
    value === 'partner' ||
    value === 'spouse' ||
    value === 'ex' ||
    value === 'child'
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isSavedLogValues(value: unknown): value is NonNullable<LifeState['log'][number]['values']> {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'string' || typeof item === 'number');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
