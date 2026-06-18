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
        <p>{locale === 'zh-CN' ? '今年没有待处理事件。长大一岁看看接下来会发生什么。' : 'No event is waiting. Age up to see what happens next.'}</p>
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
