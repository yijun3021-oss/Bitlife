import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface DeathSummaryProps {
  life: LifeState;
  onNewLife(): void;
}

export function DeathSummary({ life, onNewLife }: DeathSummaryProps) {
  const { deathSummary, locale } = life;

  return (
    <main className="app-shell">
      <section className="panel death-panel">
        <p className="eyebrow">{translate(locale, 'ui.label.deathSummary')}</p>
        <h1>{life.character.name}</h1>
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
