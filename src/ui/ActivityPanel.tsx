import { activities } from '../content/activities';
import { jobs } from '../content/jobs';
import type { AttributeName, LifeState } from '../game/types';
import { translate } from '../i18n';

interface ActivityPanelProps {
  life: LifeState;
  onRun(activityId: string): void;
  onChooseJob(jobId: string): void;
}

const attributeOrder: AttributeName[] = ['happiness', 'health', 'smarts', 'looks'];

export function ActivityPanel({ life, onChooseJob, onRun }: ActivityPanelProps) {
  const availableActivities = activities.filter((activity) => {
    if (activity.id === 'find_job') {
      return false;
    }
    if (life.character.age < activity.minAge) {
      return false;
    }
    return true;
  });
  const latestLog = life.log[0];
  const feedback = latestLog !== undefined && (latestLog.textKey.startsWith('activity.') || latestLog.textKey === 'log.jobAccepted')
    ? translate(life.locale, latestLog.textKey, latestLog.values)
    : null;
  const canChooseJob = life.character.age >= 18 && life.job === null;

  return (
    <div className="screen-stack">
      <section className="panel">
        <p className="panel-title">{translate(life.locale, 'ui.tab.activities')}</p>
        {feedback !== null && (
          <div className="feedback-panel" role="status">
            <strong>{translate(life.locale, 'ui.label.latestResult')}</strong>
            <p>{feedback}</p>
          </div>
        )}
        <div className="activity-grid">
          {availableActivities.map((activity) => {
            const cannotAfford = activity.cost > life.character.money;
            return (
              <button
                className="action-card"
                disabled={cannotAfford}
                key={activity.id}
                type="button"
                onClick={() => onRun(activity.id)}
              >
                <span className="action-card-title">
                  <span>{translate(life.locale, activity.titleKey)}</span>
                  <strong>{formatCost(activity.cost, life.locale)}</strong>
                </span>
                <span className="action-card-copy">{translate(life.locale, activity.summaryKey)}</span>
                <span className="effect-list">{formatEffects(activity.effects, life.locale)}</span>
                {cannotAfford && (
                  <span className="locked-note">{translate(life.locale, 'ui.locked.notEnoughMoney')}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {canChooseJob && (
        <section className="panel">
          <p className="panel-title">{translate(life.locale, 'ui.label.jobChoices')}</p>
          <div className="activity-grid">
            {jobs.map((job) => {
              const qualified = life.character.attributes.smarts >= job.smartsMin;
              return (
                <button
                  className="action-card"
                  disabled={!qualified}
                  key={job.id}
                  type="button"
                  onClick={() => onChooseJob(job.id)}
                >
                  <span className="action-card-title">
                    <span>{translate(life.locale, job.titleKey)}</span>
                    <strong>{formatSalary(job.salary)}</strong>
                  </span>
                  <span className="action-card-copy">
                    {translate(life.locale, 'ui.label.smartsRequirement', { value: job.smartsMin })}
                  </span>
                  {!qualified && (
                    <span className="locked-note">{translate(life.locale, 'ui.locked.notQualified')}</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function formatCost(cost: number, locale: LifeState['locale']): string {
  if (cost === 0) {
    return translate(locale, 'ui.cost.free');
  }
  return `$${cost}`;
}

function formatSalary(salary: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(salary)}/yr`;
}

function formatEffects(
  effects: (typeof activities)[number]['effects'],
  locale: LifeState['locale'],
): string {
  const parts: string[] = [];

  for (const attribute of attributeOrder) {
    const value = effects.attributes?.[attribute];
    if (value !== undefined && value !== 0) {
      parts.push(`${translate(locale, `ui.stat.${attribute}`)} ${formatSigned(value)}`);
    }
  }

  if (effects.money !== undefined && effects.money > 0) {
    parts.push(`${translate(locale, 'ui.label.money')} ${formatSigned(effects.money)}`);
  }

  return parts.join(' · ');
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
