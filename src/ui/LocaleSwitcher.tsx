import type { Locale } from '../game/types';
import { translate } from '../i18n';

interface LocaleSwitcherProps {
  locale: Locale;
  onLocaleChange(locale: Locale): void;
}

export function LocaleSwitcher({ locale, onLocaleChange }: LocaleSwitcherProps) {
  return (
    <div className="segmented-control" aria-label={translate(locale, 'ui.label.language')}>
      <button
        aria-pressed={locale === 'zh-CN'}
        type="button"
        onClick={() => onLocaleChange('zh-CN')}
      >
        中文
      </button>
      <button
        aria-pressed={locale === 'en-US'}
        type="button"
        onClick={() => onLocaleChange('en-US')}
      >
        English
      </button>
    </div>
  );
}
