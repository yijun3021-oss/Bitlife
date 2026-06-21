import type { CatalogItem } from '../schema/catalogTypes';

export interface CountryCatalogItem extends CatalogItem {
  currencyCode: string;
  taxRate: number;
  healthcareCostModifier: number;
}

const countrySource = { sourceTitle: 'Countries', sourcePage: 'Countries' };

export const countries: CountryCatalogItem[] = [
  {
    id: 'catalog_country.cn',
    titleKey: 'catalog.country.cn.title',
    summaryKey: 'catalog.country.cn.summary',
    currencyCode: 'CNY',
    taxRate: 0.2,
    healthcareCostModifier: 0.7,
    sourceRefs: [countrySource],
  },
  {
    id: 'catalog_country.us',
    titleKey: 'catalog.country.us.title',
    summaryKey: 'catalog.country.us.summary',
    currencyCode: 'USD',
    taxRate: 0.24,
    healthcareCostModifier: 1.3,
    sourceRefs: [countrySource],
  },
  {
    id: 'catalog_country.jp',
    titleKey: 'catalog.country.jp.title',
    summaryKey: 'catalog.country.jp.summary',
    currencyCode: 'JPY',
    taxRate: 0.22,
    healthcareCostModifier: 0.9,
    sourceRefs: [countrySource],
  },
];
