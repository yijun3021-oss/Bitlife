import type { LifeStateV2 } from '../game/lifeStateV2';
import type { Locale } from '../game/types';
import { translate } from '../i18n';
import { LocaleSwitcher } from './LocaleSwitcher';

interface DeathSummaryProps {
  life: LifeStateV2;
  onNewLife(): void;
  onLocaleChange(locale: Locale): void;
}

export function DeathSummary({ life, onLocaleChange, onNewLife }: DeathSummaryProps) {
  const { deathSummary, locale } = life;

  return (
    <main className="app-shell">
      <section className="panel death-panel">
        <div className="death-header">
          <div>
            <p className="eyebrow">{translate(locale, 'ui.label.deathSummary')}</p>
            <h1>{life.character.name}</h1>
          </div>
          <LocaleSwitcher locale={locale} onLocaleChange={onLocaleChange} />
        </div>
        {deathSummary !== null && (
          <dl className="detail-list">
            <div>
              <dt>{translate(locale, 'ui.label.age')}</dt>
              <dd>{deathSummary.age}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'ui.label.cause')}</dt>
              <dd>{translate(locale, deathSummary.causeKey)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'ui.label.netWorth')}</dt>
              <dd>{formatMoney(deathSummary.netWorth)}</dd>
            </div>
          </dl>
        )}
        <section className="summary-section">
          <h2>{label(locale, 'ui.achievements', 'Achievements')}</h2>
          <ul className="summary-list">
            <li>
              <span>{label(locale, 'ui.unlocked', 'Unlocked')}</span>
              <strong>{life.achievements.unlocked.length}</strong>
            </li>
            <li>
              <span>{label(locale, 'ui.prisonYears', 'Prison years')}</span>
              <strong>{life.stats.prisonYears}</strong>
            </li>
          </ul>
        </section>
        <section className="summary-section">
          <h2>{translate(locale, 'ui.label.finalRelationships')}</h2>
          <ul className="summary-list">
            {life.relationships.map((relationship) => (
              <li key={relationship.id}>
                <span>
                  {relationship.name} ({translate(locale, `relationship.${relationship.type}`)})
                </span>
                <strong>{relationship.closeness}%</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="summary-section">
          <h2>{translate(locale, 'ui.label.timeline')}</h2>
          <ol className="summary-list summary-list--timeline">
            {life.log.slice(0, 8).map((entry) => (
              <li key={entry.id}>
                <span>{entry.age}</span>
                <p>{translate(locale, entry.textKey, entry.values)}</p>
              </li>
            ))}
          </ol>
        </section>
        <button className="primary-button" type="button" onClick={onNewLife}>
          {translate(locale, 'ui.action.newLife')}
        </button>
      </section>
    </main>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function label(locale: Locale, key: string, fallback: string): string {
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}
