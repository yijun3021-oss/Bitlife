import type { LifeEvent, Locale } from '../game/types';
import { translate } from '../i18n';

interface EventCardProps {
  event: LifeEvent | null;
  locale: Locale;
  onChoose(choiceId: string): void;
}

export function EventCard({ event, locale, onChoose }: EventCardProps) {
  if (event === null) {
    return (
      <section className="panel event-panel muted-panel">
        <p className="panel-title">{translate(locale, 'ui.label.currentEvent')}</p>
        <p>{translate(locale, 'ui.empty.noEvent')}</p>
      </section>
    );
  }

  return (
    <section className="panel event-panel">
      <p className="panel-title">{translate(locale, 'ui.label.currentEvent')}</p>
      <p className="event-text">{translate(locale, event.textKey)}</p>
      <div className="choice-list">
        {event.choices.map((choice) => (
          <button className="primary-button" key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
            {translate(locale, choice.textKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
