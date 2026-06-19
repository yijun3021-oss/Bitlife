import type { Attributes, Locale } from '../game/types';
import { translate } from '../i18n';

interface StatusBarsProps {
  attributes: Attributes;
  locale: Locale;
}

const STAT_KEYS: Array<keyof Attributes> = ['happiness', 'health', 'smarts', 'looks'];

export function StatusBars({ attributes, locale }: StatusBarsProps) {
  return (
    <div className="status-bars" role="group" aria-label={translate(locale, 'ui.a11y.stats')}>
      {STAT_KEYS.map((key) => {
        const value = Math.max(0, Math.min(100, attributes[key]));

        return (
          <div className="stat-row" key={key}>
            <span className="stat-label">{translate(locale, `ui.stat.${key}`)}</span>
            <div className="stat-track" aria-hidden="true">
              <span style={{ width: `${value}%` }} />
            </div>
            <strong className="stat-value">{value}%</strong>
          </div>
        );
      })}
    </div>
  );
}
