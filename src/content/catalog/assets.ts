import type { CatalogItem } from '../schema/catalogTypes';

export type AssetCategory = 'home' | 'car' | 'aircraft' | 'boat' | 'jewelry';

export interface AssetCatalogItem extends CatalogItem {
  category: AssetCategory;
  price: number;
  yearlyUpkeep: number;
}

export const assets: AssetCatalogItem[] = [
  {
    id: 'asset.starter_condo',
    titleKey: 'catalog.asset.starterCondo.title',
    summaryKey: 'catalog.asset.starterCondo.summary',
    category: 'home',
    price: 85000,
    yearlyUpkeep: 1800,
    sourceRefs: [{ sourceTitle: 'Assets', sourcePage: 'Assets', sourceSection: 'Real Estate' }],
  },
  {
    id: 'asset.used_compact',
    titleKey: 'catalog.asset.usedCompact.title',
    summaryKey: 'catalog.asset.usedCompact.summary',
    category: 'car',
    price: 9000,
    yearlyUpkeep: 700,
    sourceRefs: [{ sourceTitle: 'Car', sourcePage: 'Car' }],
  },
  {
    id: 'asset.small_sailboat',
    titleKey: 'catalog.asset.smallSailboat.title',
    summaryKey: 'catalog.asset.smallSailboat.summary',
    category: 'boat',
    price: 24000,
    yearlyUpkeep: 1200,
    sourceRefs: [{ sourceTitle: 'Boat', sourcePage: 'Boat' }],
  },
  {
    id: 'asset.training_plane',
    titleKey: 'catalog.asset.trainingPlane.title',
    summaryKey: 'catalog.asset.trainingPlane.summary',
    category: 'aircraft',
    price: 95000,
    yearlyUpkeep: 9000,
    sourceRefs: [{ sourceTitle: 'Aircraft', sourcePage: 'Aircraft' }],
  },
  {
    id: 'asset.gold_watch',
    titleKey: 'catalog.asset.goldWatch.title',
    summaryKey: 'catalog.asset.goldWatch.summary',
    category: 'jewelry',
    price: 3500,
    yearlyUpkeep: 50,
    sourceRefs: [{ sourceTitle: 'Jewelry', sourcePage: 'Jewelry' }],
  },
];
