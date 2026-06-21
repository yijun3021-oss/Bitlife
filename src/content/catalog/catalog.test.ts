import { describe, expect, it } from 'vitest';

import { enUS } from '../../i18n/locales/en-US';
import { zhCN } from '../../i18n/locales/zh-CN';
import type { CatalogItem } from '../schema/catalogTypes';
import { validateCatalogIds, validateLocaleKeys, validateSourceRefs } from '../schema/catalogValidation';
import { achievements } from './achievements';
import { assets } from './assets';
import { careers } from './careers';
import { countries } from './countries';
import { crimes } from './crimes';
import { diseases } from './diseases';
import { educationPrograms } from './education';
import { p1Events } from './events';
import { prisonActivities } from './prison';
import { relationshipEventConfigs } from './relationships';

const allCatalogItems: CatalogItem[] = [
  ...careers,
  ...educationPrograms,
  ...relationshipEventConfigs,
  ...assets,
  ...diseases,
  ...crimes,
  ...prisonActivities,
  ...achievements,
  ...countries,
  ...p1Events,
];

describe('p1 catalogs', () => {
  it('ships full P1 catalog coverage after scale-up', () => {
    expect(careers.length).toBeGreaterThanOrEqual(50);
    expect(educationPrograms.length).toBeGreaterThanOrEqual(20);
    expect(relationshipEventConfigs.length).toBeGreaterThanOrEqual(80);
    expect(assets.length).toBeGreaterThanOrEqual(50);
    expect(diseases.length).toBeGreaterThanOrEqual(40);
    expect(crimes.length).toBeGreaterThanOrEqual(20);
    expect(prisonActivities.length).toBeGreaterThanOrEqual(40);
    expect(achievements.length).toBeGreaterThanOrEqual(80);
    expect(p1Events.length).toBeGreaterThanOrEqual(150);
  });

  it('keeps every P1 catalog item traceable and localized', () => {
    expect(validateCatalogIds(allCatalogItems)).toEqual([]);
    expect(validateSourceRefs(allCatalogItems)).toEqual([]);
    expect(validateLocaleKeys(allCatalogItems, zhCN, enUS)).toEqual([]);
  });
});
