import { describe, expect, it } from 'vitest';

import type { CatalogItem } from './catalogTypes';
import { validateCatalogIds, validateLocaleKeys, validateSourceRefs } from './catalogValidation';

const sourceRef = {
  sourceTitle: 'BitLife Wiki',
  sourcePage: 'Activities',
};

function catalogItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: 'activity.rest',
    titleKey: 'catalog.activity.rest.title',
    sourceRefs: [sourceRef],
    ...overrides,
  };
}

describe('catalog validation', () => {
  it('validateCatalogIds accepts unique ids', () => {
    const items = [
      catalogItem({ id: 'activity.rest' }),
      catalogItem({ id: 'activity.study' }),
    ];

    expect(validateCatalogIds(items)).toEqual([]);
  });

  it('validateCatalogIds reports duplicate ids', () => {
    const items = [
      catalogItem({ id: 'activity.rest' }),
      catalogItem({ id: 'activity.rest' }),
    ];

    expect(validateCatalogIds(items)).toEqual(['Duplicate catalog id: activity.rest']);
  });

  it('validateSourceRefs reports items with empty sourceRefs', () => {
    const items = [
      catalogItem({ id: 'activity.rest', sourceRefs: [] }),
      catalogItem({ id: 'activity.study' }),
    ];

    expect(validateSourceRefs(items)).toEqual(['Missing sourceRefs for catalog id: activity.rest']);
  });

  it('validateLocaleKeys reports missing keys in both locale dictionaries', () => {
    const items = [
      catalogItem({ id: 'activity.rest', titleKey: 'catalog.activity.rest.title' }),
      catalogItem({ id: 'activity.study', titleKey: 'catalog.activity.study.title' }),
    ];

    expect(
      validateLocaleKeys(items, { 'catalog.activity.rest.title': 'Rest' }, {
        'catalog.activity.study.title': 'Study',
      }),
    ).toEqual([
      'Missing zh-CN locale key for catalog id activity.study: catalog.activity.study.title',
      'Missing en-US locale key for catalog id activity.rest: catalog.activity.rest.title',
    ]);
  });
});
