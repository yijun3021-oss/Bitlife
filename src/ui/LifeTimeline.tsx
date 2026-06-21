import type { LifeLogEntry } from '../game/types';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { translate } from '../i18n';
import { EventCard } from './EventCard';

interface LifeTimelineProps {
  life: LifeStateV2;
  onChoose(choiceId: string): void;
}

interface LogYearGroup {
  age: number;
  entries: LifeLogEntry[];
}

export function LifeTimeline({ life, onChoose }: LifeTimelineProps) {
  const { character, locale } = life;
  const groupedLog = groupLogByAge(life.log);

  return (
    <section className="life-timeline" role="region" aria-label={translate(locale, 'ui.label.lifeTimeline')}>
      <header className="life-timeline__header">
        <p className="age-line">
          {translate(locale, 'ui.label.age')}: {character.age} {translate(locale, 'ui.label.years')}
        </p>
        <div className="life-timeline__current-copy">
          {life.log.slice(0, 2).map((entry) => (
            <p key={entry.id}>{translate(locale, entry.textKey, entry.values)}</p>
          ))}
        </div>
      </header>

      <EventCard event={life.currentEvent} interactive={false} locale={locale} onChoose={onChoose} />

      <section className="life-timeline__history" aria-label={translate(locale, 'ui.label.lifeLog')}>
        <p className="panel-title">{translate(locale, 'ui.label.lifeLog')}</p>
        <div className="life-timeline__entries">
          {groupedLog.map((group) => (
            <article className="life-timeline__year" key={group.age}>
              <div className="life-timeline__age-badge">{group.age}</div>
              <ol className="life-timeline__year-list">
                {group.entries.map((entry) => (
                  <li className="life-timeline__entry" key={entry.id}>
                    {translate(locale, entry.textKey, entry.values)}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function groupLogByAge(log: LifeLogEntry[]): LogYearGroup[] {
  const groups: LogYearGroup[] = [];

  for (const entry of log) {
    const current = groups[groups.length - 1];
    if (current === undefined || current.age !== entry.age) {
      groups.push({ age: entry.age, entries: [entry] });
      continue;
    }

    current.entries.push(entry);
  }

  return groups;
}
