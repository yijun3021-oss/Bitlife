import { describe, expect, it } from 'vitest';
import { createNewLife } from '../engine';
import { migrateLifeState } from '../migrations';
import { buyAsset, obtainLicense, sellAsset, settleAssetYear } from './assetSystem';

const adultLife = () => {
  const life = migrateLifeState(createNewLife({ name: 'Mina Lin', gender: 'female', countryId: 'us', locale: 'en-US', seed: 31 }));
  return { ...life, character: { ...life.character, age: 25, money: 100000 } };
};

describe('assetSystem', () => {
  it('buys an affordable asset and deducts money', () => {
    const result = buyAsset(adultLife(), 'asset.used_compact');
    expect(result.assets[0]).toMatchObject({ catalogId: 'asset.used_compact', purchaseAge: 25 });
    expect(result.character.money).toBeLessThan(100000);
  });

  it('sells an owned asset and restores its value', () => {
    const owned = buyAsset(adultLife(), 'asset.used_compact');
    const assetId = owned.assets[0].id;
    const result = sellAsset(owned, assetId);
    expect(result.assets).toHaveLength(0);
    expect(result.character.money).toBe(owned.character.money + owned.assets[0].value);
  });

  it('keeps ids unique after selling an earlier asset and buying the same catalog again', () => {
    const withFirstCar = buyAsset(adultLife(), 'asset.used_compact');
    const withWatch = buyAsset(withFirstCar, 'asset.gold_watch');
    const afterSellingCar = sellAsset(withWatch, withFirstCar.assets[0].id);
    const withSecondWatch = buyAsset(afterSellingCar, 'asset.gold_watch');
    const watchIds = withSecondWatch.assets.map((asset) => asset.id);

    expect(withSecondWatch.assets).toHaveLength(2);
    expect(new Set(watchIds)).toHaveLength(2);

    const afterSellingOneWatch = sellAsset(withSecondWatch, withSecondWatch.assets[0].id);
    expect(afterSellingOneWatch.assets).toHaveLength(1);
    expect(afterSellingOneWatch.assets[0].id).toBe(withSecondWatch.assets[1].id);
  });

  it('obtains a driving license once', () => {
    const result = obtainLicense(adultLife(), 'driving');
    expect(result.licenses.driving).toBe(true);
    expect(obtainLicense(result, 'driving')).toBe(result);
  });

  it('depreciates assets during yearly settlement', () => {
    const owned = buyAsset(adultLife(), 'asset.used_compact');
    const result = settleAssetYear(owned);
    expect(result.assets[0].value).toBeLessThan(owned.assets[0].value);
  });
});
