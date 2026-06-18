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
        <p className="eyebrow">{locale === 'zh-CN' ? '人生结算' : translate(locale, 'ui.label.deathSummary')}</p>
        <h1>{life.character.name}</h1>
        {deathSummary !== null && (
          <dl className="detail-list">
            <div>
              <dt>{locale === 'zh-CN' ? '年龄' : translate(locale, 'ui.label.age')}</dt>
              <dd>{deathSummary.age}</dd>
            </div>
            <div>
              <dt>{locale === 'zh-CN' ? '死因' : 'Cause'}</dt>
              <dd>{translate(locale, deathSummary.causeKey)}</dd>
            </div>
            <div>
              <dt>{locale === 'zh-CN' ? '净资产' : 'Net worth'}</dt>
              <dd>{formatMoney(deathSummary.netWorth)}</dd>
            </div>
          </dl>
        )}
        <button className="primary-button" type="button" onClick={onNewLife}>
          {locale === 'zh-CN' ? '开始新人生' : translate(locale, 'ui.action.newLife')}
        </button>
      </section>
    </main>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
