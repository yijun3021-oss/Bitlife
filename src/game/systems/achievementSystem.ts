import { assets } from '../../content/catalog/assets';
import { achievements, type AchievementCatalogItem } from '../../content/catalog/achievements';
import type { LifeStateV2 } from '../lifeStateV2';

export function unlockAchievements(life: LifeStateV2): LifeStateV2 {
  const unlocked = new Set(life.achievements.unlocked);

  for (const achievement of achievements) {
    if (isUnlockedByState(life, achievement)) {
      unlocked.add(achievement.id);
    }
  }

  return { ...life, achievements: { unlocked: [...unlocked] } };
}

function isUnlockedByState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (achievement.id === 'achievement.long_life') {
    return life.character.age >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.first_million') {
    return life.character.money >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.steady_career') {
    return life.career.currentJobId !== null && life.career.yearsInRole >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.family_anchor') {
    return life.family.childrenIds.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.second_chance') {
    return life.stats.prisonYears >= achievement.targetValue;
  }

  return isUnlockedByCatalogState(life, achievement);
}

function isUnlockedByCatalogState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (achievement.category === 'longevity') {
    return isUnlockedByLongevityState(life, achievement);
  }
  if (achievement.category === 'wealth') {
    return isUnlockedByWealthState(life, achievement);
  }
  if (achievement.category === 'career') {
    return isUnlockedByCareerState(life, achievement);
  }
  if (achievement.category === 'relationship') {
    return isUnlockedByRelationshipState(life, achievement);
  }
  return isUnlockedByCrimeState(life, achievement);
}

function isUnlockedByLongevityState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  const ageMilestoneIds = new Set([
    'achievement.first_steps_goal',
    'achievement.teen_milestone',
    'achievement.adult_milestone',
    'achievement.thirty_candles',
    'achievement.midlife_marker',
    'achievement.silver_years',
    'achievement.golden_years',
    'achievement.seventy_strong',
    'achievement.eighty_five_club',
    'achievement.ninety_years',
    'achievement.century_life',
    'achievement.calm_decades',
  ]);

  return ageMilestoneIds.has(achievement.id) && life.character.age >= achievement.targetValue;
}

function isUnlockedByWealthState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (cashSavingsAchievementIds.has(achievement.id)) {
    return life.character.money >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.asset_collector') {
    return life.assets.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.property_owner') {
    return life.assets.some((asset) => getAssetCatalog(asset.catalogId)?.category === 'home');
  }
  if (achievement.id === 'achievement.car_buyer') {
    return life.assets.some((asset) => {
      const catalog = getAssetCatalog(asset.catalogId);
      return catalog?.category === 'car' && Math.max(asset.value, catalog.price) >= achievement.targetValue;
    });
  }
  if (achievement.id === 'achievement.luxury_purchase') {
    return life.assets.some((asset) => {
      const catalog = getAssetCatalog(asset.catalogId);
      return Math.max(asset.value, catalog?.price ?? 0) >= 50000;
    });
  }
  if (achievement.id === 'achievement.high_upkeep_life') {
    return life.assets.reduce((total, asset) => total + (getAssetCatalog(asset.catalogId)?.yearlyUpkeep ?? 0), 0) >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.legacy_estate') {
    return life.character.money + life.assets.reduce((total, asset) => total + asset.value, 0) >= achievement.targetValue;
  }
  return false;
}

function isUnlockedByCareerState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (achievement.id === 'achievement.first_paycheck') {
    return life.stats.totalIncome >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.five_year_role' || achievement.id === 'achievement.skilled_worker') {
    return life.career.yearsInRole >= achievement.targetValue || life.stats.workYears >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.professional_track') {
    return life.career.currentJobId !== null;
  }
  if (achievement.id === 'achievement.high_earner') {
    return life.stats.totalIncome >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.medical_path') {
    return currentCareerMatches(life, ['nurse', 'paramedic', 'dental', 'radiology', 'pharmacist', 'veterinarian', 'therapist', 'psychologist', 'dentist', 'physician', 'surgeon']);
  }
  if (achievement.id === 'achievement.legal_path') {
    return currentCareerMatches(life, ['law', 'paralegal', 'judge']);
  }
  if (achievement.id === 'achievement.tech_path') {
    return currentCareerMatches(life, ['software', 'web_developer', 'data_analyst']);
  }
  if (achievement.id === 'achievement.public_service') {
    return currentCareerMatches(life, ['teacher', 'police', 'detective', 'firefighter']);
  }
  if (achievement.id === 'achievement.retired_worker') {
    return life.career.retired && life.character.age >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.work_legend') {
    return life.stats.workYears >= achievement.targetValue;
  }
  return false;
}

function isUnlockedByRelationshipState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  const aliveRelationships = life.relationships.filter((relationship) => relationship.alive);
  const friends = aliveRelationships.filter((relationship) => relationship.type === 'friend');
  const family = aliveRelationships.filter((relationship) =>
    relationship.type === 'mother' ||
    relationship.type === 'father' ||
    relationship.type === 'sibling' ||
    relationship.type === 'spouse' ||
    relationship.type === 'child'
  );

  if (achievement.id === 'achievement.new_friend_goal') {
    return friends.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.loyal_friend') {
    return friends.length >= achievement.targetValue || friends.filter((relationship) => relationship.closeness >= 80).length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.first_love_goal') {
    return aliveRelationships.some((relationship) => relationship.type === 'partner' || relationship.type === 'spouse' || relationship.type === 'ex');
  }
  if (achievement.id === 'achievement.married_life') {
    return life.family.spouseId !== null || life.family.marriageCount >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.parent_life') {
    return life.family.childrenIds.length >= achievement.targetValue || aliveRelationships.filter((relationship) => relationship.type === 'child').length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.family_circle') {
    return family.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.trusted_sibling') {
    return aliveRelationships.some((relationship) => relationship.type === 'sibling' && relationship.closeness >= 90);
  }
  if (achievement.id === 'achievement.household_harmony') {
    return family.length >= 4 && family.every((relationship) => relationship.closeness >= achievement.targetValue);
  }
  if (achievement.id === 'achievement.beloved_elder') {
    return life.character.age >= achievement.targetValue && aliveRelationships.some((relationship) => relationship.closeness >= 80);
  }
  return false;
}

function isUnlockedByCrimeState(life: LifeStateV2, achievement: AchievementCatalogItem): boolean {
  if (achievement.id === 'achievement.risky_choice_goal' || achievement.id === 'achievement.case_closed') {
    return life.stats.crimesSucceeded >= achievement.targetValue || life.criminalRecord.arrests.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.petty_run' || achievement.id === 'achievement.crime_spree') {
    return life.stats.crimesSucceeded >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.prison_year_goal' || achievement.id === 'achievement.hard_time' || achievement.id === 'achievement.second_chance_plus') {
    return life.stats.prisonYears >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.parole_hope') {
    return life.prison.paroleEligible;
  }
  if (achievement.id === 'achievement.white_collar_path') {
    return life.criminalRecord.convictions.some((conviction) =>
      ['crime.fraud', 'crime.tax_evasion', 'crime.embezzlement', 'crime.money_laundering', 'crime.cybercrime'].includes(conviction.crimeId),
    );
  }
  if (achievement.id === 'achievement.shadow_network') {
    return life.stats.crimesSucceeded >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.repeat_offender') {
    return life.criminalRecord.arrests.length >= achievement.targetValue || life.criminalRecord.convictions.length >= achievement.targetValue;
  }
  if (achievement.id === 'achievement.notorious_name') {
    return life.stats.crimesSucceeded + life.criminalRecord.arrests.length + life.criminalRecord.convictions.length >= achievement.targetValue;
  }
  return false;
}

const cashSavingsAchievementIds = new Set([
  'achievement.rainy_day_fund',
  'achievement.first_ten_thousand',
  'achievement.home_down_payment',
  'achievement.comfortable_savings',
  'achievement.six_figure_balance',
  'achievement.investment_starter',
  'achievement.half_million',
  'achievement.two_million_mark',
]);

function getAssetCatalog(assetCatalogId: string) {
  return assets.find((asset) => asset.id === assetCatalogId);
}

function currentCareerMatches(life: LifeStateV2, fragments: string[]): boolean {
  return life.career.currentJobId !== null && fragments.some((fragment) => life.career.currentJobId?.includes(fragment) === true);
}
