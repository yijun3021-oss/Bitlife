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
        <p className="panel-title">{locale === 'zh-CN' ? '学校' : translate(locale, 'ui.label.school')}</p>
        <dl className="detail-list">
          <div>
            <dt>{locale === 'zh-CN' ? '阶段' : 'Stage'}</dt>
            <dd>{schoolStageLabel(school.stage, locale)}</dd>
          </div>
          <div>
            <dt>{locale === 'zh-CN' ? '年级' : 'Grade'}</dt>
            <dd>{school.grade || '-'}</dd>
          </div>
          <div>
            <dt>{locale === 'zh-CN' ? '压力' : 'Stress'}</dt>
            <dd>{school.stress}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <p className="panel-title">{locale === 'zh-CN' ? '工作' : translate(locale, 'ui.label.work')}</p>
        {job === null ? (
          <p className="empty-text">{locale === 'zh-CN' ? '暂无工作' : 'No job yet'}</p>
        ) : (
          <dl className="detail-list">
            <div>
              <dt>{locale === 'zh-CN' ? '职位' : 'Role'}</dt>
              <dd>{translate(locale, job.titleKey)}</dd>
            </div>
            <div>
              <dt>{locale === 'zh-CN' ? '薪水' : 'Salary'}</dt>
              <dd>{formatMoney(job.salary)}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}

function schoolStageLabel(stage: LifeState['school']['stage'], locale: LifeState['locale']): string {
  const labels = {
    none: locale === 'zh-CN' ? '未入学' : 'None',
    elementary: locale === 'zh-CN' ? '小学' : 'Elementary',
    middle: locale === 'zh-CN' ? '中学' : 'Middle school',
    finished: locale === 'zh-CN' ? '已毕业' : 'Finished',
  };
  return labels[stage];
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
