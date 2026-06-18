import { activities } from '../content/activities';
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface ActivityPanelProps {
  life: LifeState;
  onRun(activityId: string): void;
}

export function ActivityPanel({ life, onRun }: ActivityPanelProps) {
  return (
    <section className="panel">
      <p className="panel-title">{translate(life.locale, 'ui.tab.activities')}</p>
      <div className="activity-grid">
        {activities.map((activity) => (
          <button className="secondary-button" key={activity.id} type="button" onClick={() => onRun(activity.id)}>
            {translate(life.locale, activity.titleKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
