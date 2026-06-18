import { activities } from '../content/activities';
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface ActivityPanelProps {
  life: LifeState;
  onRun(activityId: string): void;
}

export function ActivityPanel({ life, onRun }: ActivityPanelProps) {
  const availableActivities = activities.filter((activity) => {
    if (life.character.age < activity.minAge) {
      return false;
    }
    return activity.id !== 'find_job' || life.job === null;
  });

  return (
    <section className="panel">
      <p className="panel-title">{translate(life.locale, 'ui.tab.activities')}</p>
      <div className="activity-grid">
        {availableActivities.map((activity) => (
          <button className="secondary-button" key={activity.id} type="button" onClick={() => onRun(activity.id)}>
            {translate(life.locale, activity.titleKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
