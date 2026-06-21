import type { LifeStateV2 } from '../game/lifeStateV2';
import { translate } from '../i18n';
import { EventCard } from './EventCard';

interface DashboardProps {
  life: LifeStateV2;
  onChoose(choiceId: string): void;
}

export function Dashboard({ life, onChoose }: DashboardProps) {
  const { character, locale } = life;

  return (
    <div className="life-dashboard">
      <section className="life-story-panel">
        <p className="age-line">
          {translate(locale, 'ui.label.age')}: {character.age} {translate(locale, 'ui.label.years')}
        </p>
        <div className="life-story-copy">
          {life.log.slice(0, 3).map((entry) => (
            <p key={entry.id}>{translate(locale, entry.textKey, entry.values)}</p>
          ))}
        </div>
      </section>

      <EventCard event={life.currentEvent} locale={locale} onChoose={onChoose} />

      <section className="panel log-panel">
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
