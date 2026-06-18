import type { LifeState } from '../game/types';
import { translate } from '../i18n';
import { EventCard } from './EventCard';
import { StatusBars } from './StatusBars';

interface DashboardProps {
  life: LifeState;
  onAgeUp(): void;
  onChoose(choiceId: string): void;
}

export function Dashboard({ life, onAgeUp, onChoose }: DashboardProps) {
  const { character, locale } = life;
  const hasPendingEvent = life.currentEvent !== null;

  return (
    <div className="screen-stack">
      <section className="panel profile-panel">
        <div className="profile-topline">
          <div>
            <p className="eyebrow">{translate(locale, 'ui.tab.life')}</p>
            <h1>{character.name}</h1>
          </div>
          <button className="age-button" type="button" disabled={hasPendingEvent} onClick={onAgeUp}>
            {translate(locale, 'ui.action.ageUp')}
          </button>
        </div>
        <dl className="quick-stats">
          <div>
            <dt>{translate(locale, 'ui.label.age')}</dt>
            <dd>{character.age}</dd>
          </div>
          <div>
            <dt>{translate(locale, 'ui.label.money')}</dt>
            <dd>{formatMoney(character.money)}</dd>
          </div>
        </dl>
        <StatusBars attributes={character.attributes} locale={locale} />
      </section>

      <EventCard event={life.currentEvent} locale={locale} onChoose={onChoose} />

      <section className="panel">
        <p className="panel-title">{translate(locale, 'ui.label.lifeLog')}</p>
        <ol className="log-list">
          {life.log.slice(0, 5).map((entry) => (
            <li key={entry.id}>
              <span>{entry.age}</span>
              <p>{translate(locale, entry.textKey, entry.values)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
