import { careers } from '../content/catalog/careers';
import { educationPrograms } from '../content/catalog/education';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { translate } from '../i18n';

interface SchoolWorkPanelProps {
  life: LifeStateV2;
  onApplyForCareer(careerId: string): void;
  onEnroll(programId: string): void;
}

export function SchoolWorkPanel({ life, onApplyForCareer, onEnroll }: SchoolWorkPanelProps) {
  const { career, education, locale, school, job } = life;

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

      <section className="panel">
        <h2 className="panel-title">{label(locale, 'ui.education', 'Education')}</h2>
        <div className="menu-list">
          {educationPrograms.map((program) => {
            const locked =
              life.character.age < program.minAge ||
              life.character.attributes.smarts < program.smartsMin ||
              life.character.money < program.tuition ||
              (education.majorId !== null && !education.graduated);
            return (
              <button
                className={`menu-row action-row${locked ? ' is-disabled' : ''}`}
                disabled={locked}
                key={program.id}
                type="button"
                onClick={() => onEnroll(program.id)}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:graduation-cap')} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(locale, program.titleKey)}</span>
                  <span className="menu-subtitle">{summary(locale, program.summaryKey)}</span>
                  {locked && (
                    <span className="locked-note">
                      {life.character.age < program.minAge
                        ? translate(locale, 'ui.locked.availableAtAge', { age: program.minAge })
                        : translate(locale, 'ui.locked.notQualified')}
                    </span>
                  )}
                </span>
                <span className="menu-row-price">{formatCost(program.tuition, locale)}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">{label(locale, 'ui.career', 'Career')}</h2>
        <div className="menu-list">
          {careers.map((catalogCareer) => {
            const educationMatches =
              catalogCareer.educationLevel === 'none' ||
              (education.level === catalogCareer.educationLevel && education.graduated);
            const locked =
              life.character.age < 18 ||
              career.currentJobId !== null ||
              life.character.attributes.smarts < catalogCareer.smartsMin ||
              !educationMatches;
            return (
              <button
                className={`menu-row action-row${locked ? ' is-disabled' : ''}`}
                disabled={locked}
                key={catalogCareer.id}
                type="button"
                onClick={() => onApplyForCareer(catalogCareer.id)}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:briefcase')} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(locale, catalogCareer.titleKey)}</span>
                  <span className="menu-subtitle">{summary(locale, catalogCareer.summaryKey)}</span>
                  {locked && <span className="locked-note">{translate(locale, 'ui.locked.notQualified')}</span>}
                </span>
                <span className="menu-row-price">{formatSalary(catalogCareer.salary)}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function schoolStageLabel(stage: LifeStateV2['school']['stage'], locale: LifeStateV2['locale']): string {
  return translate(locale, `schoolStage.${stage}`);
}

function formatCost(cost: number, locale: LifeStateV2['locale']): string {
  if (cost === 0) {
    return translate(locale, 'ui.cost.free');
  }
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(cost)}`;
}

function formatSalary(salary: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(salary)}/yr`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
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
