import { activities } from '../content/activities';
import { jobs } from '../content/jobs';
import type { LifeStateV2 } from '../game/lifeStateV2';
import type { AttributeName } from '../game/types';
import { translate } from '../i18n';

interface ActivityPanelProps {
  life: LifeStateV2;
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
        <div className="menu-list">
          {availableActivities.map((activity) => {
            const cannotAfford = activity.cost > life.character.money;
            const usedThisAge = activity.oncePerAge === true && life.usedActivitiesThisAge.includes(activity.id);
            const lockedReason =
              usedThisAge ? translate(life.locale, 'ui.locked.usedThisYear')
              : cannotAfford ? translate(life.locale, 'ui.locked.notEnoughMoney')
              : null;
            return (
              <button
                className={`menu-row action-row${lockedReason !== null ? ' is-disabled' : ''}`}
                disabled={lockedReason !== null}
                key={activity.id}
                type="button"
                onClick={() => onRun(activity.id)}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl(activity.icon)} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(life.locale, activity.titleKey)}</span>
                  <span className="menu-subtitle">{translate(life.locale, activity.summaryKey)}</span>
                  <span className="effect-list">{formatEffects(activity.effects, life.locale)}</span>
                  {lockedReason !== null && <span className="locked-note">{lockedReason}</span>}
                </span>
                <span className="menu-row-price">{formatCost(activity.cost, life.locale)}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            );
          })}
        </div>
      </section>

      {canChooseJob && (
        <section className="panel">
          <p className="panel-title">{translate(life.locale, 'ui.label.jobChoices')}</p>
          <div className="menu-list">
            {jobs.map((job) => {
              const qualified = life.character.attributes.smarts >= job.smartsMin;
              return (
                <button
                  className={`menu-row action-row${qualified ? '' : ' is-disabled'}`}
                  disabled={!qualified}
                  key={job.id}
                  type="button"
                  onClick={() => onChooseJob(job.id)}
                >
                  <span className="menu-icon-wrap">
                    <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:briefcase')} alt="" />
                  </span>
                  <span className="menu-copy">
                    <span className="menu-title">{translate(life.locale, job.titleKey)}</span>
                    <span className="menu-subtitle">
                      {translate(life.locale, 'ui.label.smartsRequirement', { value: job.smartsMin })}
                    </span>
                    {!qualified && (
                      <span className="locked-note">{translate(life.locale, 'ui.locked.notQualified')}</span>
                    )}
                  </span>
                  <span className="menu-row-price">{formatSalary(job.salary)}</span>
                  <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function formatCost(cost: number, locale: LifeStateV2['locale']): string {
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
  locale: LifeStateV2['locale'],
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

  if (effects.school?.stress !== undefined && effects.school.stress !== 0) {
    parts.push(`${translate(locale, 'ui.label.stress')} ${formatSigned(effects.school.stress)}`);
  }

  return parts.join(' · ');
}

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function iconUrl(icon: string): string {
  return `https://api.iconify.design/${icon}.svg`;
}
