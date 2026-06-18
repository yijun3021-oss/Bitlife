import { describe, expect, it } from 'vitest';

import { translate } from './index';

describe('translate', () => {
  it('returns Simplified Chinese text for known keys', () => {
    expect(translate('zh-CN', 'ui.action.ageUp')).toBe('长大一岁');
    expect(translate('zh-CN', 'country.cn')).toBe('中国');
    expect(translate('zh-CN', 'event.birth.sunny.text')).toContain('世界');
  });

  it('returns English text for a known key', () => {
    expect(translate('en-US', 'ui.action.ageUp')).toBe('Age up');
  });

  it('interpolates placeholder values', () => {
    expect(translate('en-US', 'log.birth', { name: 'Mina' })).toBe('Mina was born.');
  });
});
