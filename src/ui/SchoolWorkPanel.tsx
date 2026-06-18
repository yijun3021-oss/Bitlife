import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface SchoolWorkPanelProps {
  life: LifeState;
}

export function SchoolWorkPanel({ life }: SchoolWorkPanelProps) {
  const { locale, school, job } = life;

  return (
    <div className="screen-stack">
      <section className="panel">
        <p className="panel-title">{translate(locale, 'ui.label.school')}</p>
        <dl className="detail-list">
          <div>
            <dt>{translate(locale, 'ui.label.stage')}</dt>
            <dd>{schoolStageLabel(school.stage, locale)}</dd>
          </div>
          <div>
            <dt>{translate(locale, 'ui.label.grade')}</dt>
            <dd>{school.grade || '-'}</dd>
          </div>
          <div>
            <dt>{translate(locale, 'ui.label.stress')}</dt>
            <dd>{school.stress}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <p className="panel-title">{translate(locale, 'ui.label.work')}</p>
        {job === null ? (
          <p className="empty-text">{translate(locale, 'ui.empty.noJob')}</p>
        ) : (
          <dl className="detail-list">
            <div>
              <dt>{translate(locale, 'ui.label.role')}</dt>
              <dd>{translate(locale, job.titleKey)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'ui.label.salary')}</dt>
              <dd>{formatMoney(job.salary)}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}

function schoolStageLabel(stage: LifeState['school']['stage'], locale: LifeState['locale']): string {
  return translate(locale, `schoolStage.${stage}`);
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
