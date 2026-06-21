import { describe, expect, it } from 'vitest';

import { translate } from './index';
import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';

const p1PanelKeys = ['ui.profile', 'ui.assets', 'ui.health', 'ui.crime', 'ui.prison', 'ui.achievements'] as const;
const p1RuntimeEventKeys = ['event.p1Catalog.choice.continue', 'event.p1Catalog.result'] as const;

describe('translate', () => {
  it('returns Simplified Chinese text for known keys', () => {
    expect(translate('zh-CN', 'ui.action.ageUp')).toBe('长大一岁');
    expect(translate('zh-CN', 'country.cn')).toBe('中国');
    expect(translate('zh-CN', 'event.birth.sunny.text')).toContain('世界');
  });

  it('returns English text for a known key', () => {
    expect(translate('en-US', 'ui.action.ageUp')).toBe('Age up');
  });

  it('returns labels for P1 relationship kinds in both locales', () => {
    const kinds = ['friend', 'partner', 'spouse', 'ex', 'child'];

    expect(kinds.map((kind) => translate('en-US', `relationship.${kind}`))).toEqual([
      'Friend',
      'Partner',
      'Spouse',
      'Ex',
      'Child',
    ]);
    expect(kinds.map((kind) => translate('zh-CN', `relationship.${kind}`))).toEqual([
      '朋友',
      '伴侣',
      '配偶',
      '前任',
      '孩子',
    ]);
  });

  it('contains P1 panel labels in both locales', () => {
    for (const key of p1PanelKeys) {
      expect(enUS[key]).toBeTypeOf('string');
      expect(zhCN[key]).toBeTypeOf('string');
    }
  });

  it('contains generic P1 catalog event choice and result text in both locales', () => {
    for (const key of p1RuntimeEventKeys) {
      expect(enUS[key]).toBeTypeOf('string');
      expect(zhCN[key]).toBeTypeOf('string');
    }
  });

  it('interpolates placeholder values', () => {
    expect(translate('en-US', 'log.birth', { name: 'Mina' })).toBe('Mina was born.');
  });
});
