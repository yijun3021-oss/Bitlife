import { diseases } from '../../content/catalog/diseases';
import type { LifeStateV2 } from '../../game/lifeStateV2';
import { translate } from '../../i18n';

interface HealthPanelProps {
  life: LifeStateV2;
  onTreatDisease(diseaseId: string, treatmentId: string): void;
}

export function HealthPanel({ life, onTreatDisease }: HealthPanelProps) {
  const { locale } = life;
  const activeDiseases = diseases.filter((disease) => life.health.diseases.includes(disease.id));

  return (
    <section className="panel" aria-labelledby="health-heading">
      <h2 className="panel-title" id="health-heading">
        {label(locale, 'ui.health', 'Health')}
      </h2>
      <dl className="detail-list">
        <div>
          <dt>{translate(locale, 'ui.stat.health')}</dt>
          <dd>{life.character.attributes.health}%</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.recoveredDiseases', 'Recovered')}</dt>
          <dd>{life.stats.diseasesRecovered}</dd>
        </div>
      </dl>
      <div className="panel-subsection">
        <p className="section-kicker">{label(locale, 'ui.activeDiseases', 'Active conditions')}</p>
        {activeDiseases.length === 0 ? (
          <p className="empty-text">{label(locale, 'ui.empty.noDiseases', 'No active conditions')}</p>
        ) : (
          <div className="menu-list">
            {activeDiseases.map((disease) => (
              <button
                className="menu-row action-row"
                key={disease.id}
                type="button"
                onClick={() => onTreatDisease(disease.id, 'treatment.standard')}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:medical-symbol')} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(locale, disease.titleKey)}</span>
                  <span className="menu-subtitle">{summary(locale, disease.summaryKey)}</span>
                </span>
                <span className="menu-row-price">{label(locale, 'ui.action.treat', 'Treat')}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
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
