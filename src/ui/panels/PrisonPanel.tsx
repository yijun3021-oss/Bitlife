import { prisonActivities } from '../../content/catalog/prison';
import type { LifeStateV2 } from '../../game/lifeStateV2';
import { translate } from '../../i18n';

interface PrisonPanelProps {
  life: LifeStateV2;
  onAttemptAppeal(): void;
}

export function PrisonPanel({ life, onAttemptAppeal }: PrisonPanelProps) {
  const { locale, prison } = life;
  if (!prison.incarcerated) {
    return null;
  }

  const appeal = prisonActivities.find((activity) => activity.id === 'prison.appeal');

  return (
    <section className="panel" aria-labelledby="prison-heading">
      <h2 className="panel-title" id="prison-heading">
        {label(locale, 'ui.prison', 'Prison')}
      </h2>
      <dl className="detail-list">
        <div>
          <dt>{label(locale, 'ui.remainingYears', 'Remaining years')}</dt>
          <dd>{prison.remainingYears}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.prisonBehavior', 'Behavior')}</dt>
          <dd>{prison.behavior}%</dd>
        </div>
      </dl>
      {appeal !== undefined && (
        <div className="menu-list panel-subsection">
          <button
            className={`menu-row action-row${prison.appealAvailable ? '' : ' is-disabled'}`}
            disabled={!prison.appealAvailable}
            type="button"
            onClick={onAttemptAppeal}
          >
            <span className="menu-icon-wrap">
              <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:balance-scale')} alt="" />
            </span>
            <span className="menu-copy">
              <span className="menu-title">{translate(locale, appeal.titleKey)}</span>
              <span className="menu-subtitle">{summary(locale, appeal.summaryKey)}</span>
            </span>
            <span className="menu-row-price">{label(locale, 'ui.action.appeal', 'Appeal')}</span>
            <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
          </button>
        </div>
      )}
    </section>
  );
}

function label(locale: LifeStateV2['locale'], key: string, fallback: string): string {
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}

function summary(locale: LifeStateV2['locale'], key: string | undefined): string {
  return key === undefined ? '' : translate(locale, key);
}

function iconUrl(icon: string): string {
  return `https://api.iconify.design/${icon}.svg`;
}
