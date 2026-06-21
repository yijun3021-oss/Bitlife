import type { AttributeName, LifeEvent, LifeEventOption, Locale } from '../game/types';
import { PASS_EVENT_CHOICE_ID } from '../game/types';
import { translate } from '../i18n';

interface EventCardProps {
  event: LifeEvent | null;
  interactive?: boolean;
  locale: Locale;
  onChoose(choiceId: string): void;
}

export function EventCard({ event, interactive = true, locale, onChoose }: EventCardProps) {
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
      {interactive && (
        <div className="choice-list">
          {event.choices.map((choice) => (
            <button className="primary-button choice-button" key={choice.id} type="button" onClick={() => onChoose(choice.id)}>
              <span>{translate(locale, choice.textKey)}</span>
              <small>{formatChoiceEffects(choice, locale)}</small>
            </button>
          ))}
          {event.choices.length < 2 && (
            <button className="secondary-button choice-button" type="button" onClick={() => onChoose(PASS_EVENT_CHOICE_ID)}>
              <span>{translate(locale, 'ui.choice.letItPass')}</span>
              <small>{translate(locale, 'ui.choice.noEffect')}</small>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

const attributeOrder: AttributeName[] = ['happiness', 'health', 'smarts', 'looks'];

export function formatChoiceEffects(choice: LifeEventOption, locale: Locale): string {
  const parts: string[] = [];

  for (const attribute of attributeOrder) {
    const value = choice.effects.attributes?.[attribute];
    if (value !== undefined && value !== 0) {
      parts.push(`${translate(locale, `ui.stat.${attribute}`)} ${formatSigned(value)}`);
    }
  }

  if (choice.effects.money !== undefined && choice.effects.money !== 0) {
    parts.push(`${translate(locale, 'ui.label.money')} ${formatSigned(choice.effects.money)}`);
  }

  return parts.length > 0 ? parts.join(' · ') : translate(locale, 'ui.choice.noEffect');
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
