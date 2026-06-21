import type { LifeEvent, Locale } from '../game/types';
import { PASS_EVENT_CHOICE_ID } from '../game/types';
import { translate } from '../i18n';
import { formatChoiceEffects } from './EventCard';

interface EventModalProps {
  event: LifeEvent | null;
  locale: Locale;
  resultTextKey: string | null;
  onChoose(choiceId: string): void;
  onDismissResult(): void;
}

export function EventModal({ event, locale, resultTextKey, onChoose, onDismissResult }: EventModalProps) {
  if (resultTextKey !== null) {
    return (
      <div className="event-modal-backdrop event-modal-backdrop--result" onClick={onDismissResult}>
        <section
          aria-labelledby="event-result-title"
          aria-modal="true"
          className="event-modal-shell event-modal-shell--result"
          role="dialog"
        >
          <div className="event-modal-card event-result-card">
            <h2 className="event-modal-title event-result-title" id="event-result-title">
              {translate(locale, 'ui.label.eventResult')}
            </h2>
            <p className="event-modal-text">{translate(locale, resultTextKey)}</p>
            <p className="event-result-hint">{translate(locale, 'ui.eventResult.tapToContinue')}</p>
          </div>
        </section>
      </div>
    );
  }

  if (event === null) {
    return null;
  }

  return (
    <div className="event-modal-backdrop">
      <section
        aria-labelledby="event-modal-title"
        aria-modal="true"
        className="event-modal-shell event-modal-shell--event"
        role="dialog"
      >
        <div className="event-modal-card">
          <h2 className="event-modal-title" id="event-modal-title">
            {translate(locale, 'ui.label.currentEvent')}
          </h2>
          <p className="event-modal-text">{translate(locale, event.textKey)}</p>
        </div>
        <div className="event-modal-actions">
          {event.choices.map((choice) => (
            <button className="event-modal-choice" key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
              <span>{translate(locale, choice.textKey)}</span>
              <small>{formatChoiceEffects(choice, locale)}</small>
            </button>
          ))}
          {event.choices.length < 2 && (
            <button className="event-modal-choice" type="button" onClick={() => onChoose(PASS_EVENT_CHOICE_ID)}>
              <span>{translate(locale, 'ui.choice.letItPass')}</span>
              <small>{translate(locale, 'ui.choice.noEffect')}</small>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
