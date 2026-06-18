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
              <span>{statLabel(key, locale)}</span>
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

function statLabel(key: keyof Attributes, locale: Locale): string {
  if (locale !== 'zh-CN') {
    return translate(locale, `ui.stat.${key}`);
  }

  const labels: Record<keyof Attributes, string> = {
    happiness: '幸福',
    health: '健康',
    smarts: '智力',
    looks: '外貌',
  };
  return labels[key];
}
