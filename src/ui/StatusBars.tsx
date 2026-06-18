import type { Attributes, Locale } from '../game/types';
import { translate } from '../i18n';

interface StatusBarsProps {
  attributes: Attributes;
  locale: Locale;
}

const STAT_KEYS: Array<keyof Attributes> = ['happiness', 'health', 'smarts', 'looks'];

export function StatusBars({ attributes, locale }: StatusBarsProps) {
  return (
    <div className="status-bars" aria-label={locale === 'zh-CN' ? '状态' : 'Stats'}>
      {STAT_KEYS.map((key) => {
        const value = Math.max(0, Math.min(100, attributes[key]));

        return (
          <div className="stat-row" key={key}>
            <div className="stat-label">
              <span>{translate(locale, `ui.stat.${key}`)}</span>
              <strong>{value}</strong>
            </div>
            <div className="stat-track" aria-hidden="true">
              <span style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
