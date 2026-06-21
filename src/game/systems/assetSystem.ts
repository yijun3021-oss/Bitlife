import { assets } from '../../content/catalog/assets';
import type { LicenseKind, LifeStateV2 } from '../lifeStateV2';

export function buyAsset(life: LifeStateV2, assetCatalogId: string): LifeStateV2 {
  const asset = assets.find((item) => item.id === assetCatalogId);
  if (asset === undefined || life.character.money < asset.price) {
    return life;
  }

  const owned = {
    id: createOwnedAssetId(life, asset.id),
    catalogId: asset.id,
    value: asset.price,
    purchaseAge: life.character.age,
  };

  return {
    ...life,
    character: { ...life.character, money: life.character.money - asset.price },
    assets: [...life.assets, owned],
  };
}

export function sellAsset(life: LifeStateV2, ownedAssetId: string): LifeStateV2 {
  const owned = life.assets.find((item) => item.id === ownedAssetId);
  if (owned === undefined) {
    return life;
  }

  return {
    ...life,
    character: { ...life.character, money: life.character.money + owned.value },
    assets: life.assets.filter((item) => item.id !== ownedAssetId),
  };
}

export function obtainLicense(life: LifeStateV2, license: LicenseKind): LifeStateV2 {
  if (life.licenses[license]) {
    return life;
  }

  return { ...life, licenses: { ...life.licenses, [license]: true } };
}

export function settleAssetYear(life: LifeStateV2): LifeStateV2 {
  return {
    ...life,
    assets: life.assets.map((item) => ({ ...item, value: Math.max(0, Math.round(item.value * 0.9)) })),
  };
}

function createOwnedAssetId(life: LifeStateV2, assetCatalogId: string): string {
  const existingIds = new Set(life.assets.map((item) => item.id));
  let suffix = life.assets.length;
  let id = `owned_${assetCatalogId}_${life.character.age}_${suffix}`;

  while (existingIds.has(id)) {
    suffix += 1;
    id = `owned_${assetCatalogId}_${life.character.age}_${suffix}`;
  }

  return id;
}
