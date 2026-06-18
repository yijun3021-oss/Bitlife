import { activities } from '../content/activities';
import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface ActivityPanelProps {
  life: LifeState;
  onRun(activityId: string): void;
}

export function ActivityPanel({ life, onRun }: ActivityPanelProps) {
  const availableActivities = activities.filter((activity) => life.character.age >= activity.minAge);

  return (
    <section className="panel">
      <p className="panel-title">{life.locale === 'zh-CN' ? '活动' : translate(life.locale, 'ui.tab.activities')}</p>
      <div className="activity-grid">
        {availableActivities.map((activity) => (
          <button className="secondary-button" key={activity.id} type="button" onClick={() => onRun(activity.id)}>
            {activityTitle(activity.id, life.locale, activity.titleKey)}
          </button>
        ))}
      </div>
    </section>
  );
}

function activityTitle(activityId: string, locale: LifeState['locale'], titleKey: string): string {
  if (locale !== 'zh-CN') {
    return translate(locale, titleKey);
  }

  const labels: Record<string, string> = {
    rest: '休息',
    study: '学习',
    family_time: '陪伴家人',
    doctor_visit: '看医生',
    find_job: '找工作',
  };
  return labels[activityId] ?? translate(locale, titleKey);
}
