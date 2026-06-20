import { crimes } from '../../content/catalog/crimes';
import type { LifeStateV2 } from '../../game/lifeStateV2';
import { translate } from '../../i18n';

interface CrimePanelProps {
  life: LifeStateV2;
  onAttemptCrime(crimeId: string): void;
}

export function CrimePanel({ life, onAttemptCrime }: CrimePanelProps) {
  const { criminalRecord, locale } = life;
  const lockedByPrison = life.prison.incarcerated;

  return (
    <section className="panel" aria-labelledby="crime-heading">
      <h2 className="panel-title" id="crime-heading">
        {label(locale, 'ui.crime', 'Crime')}
      </h2>
      <dl className="detail-list">
        <div>
          <dt>{label(locale, 'ui.arrests', 'Arrests')}</dt>
          <dd>{criminalRecord.arrests.length}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.convictions', 'Convictions')}</dt>
          <dd>{criminalRecord.convictions.length}</dd>
        </div>
      </dl>
      <div className="panel-subsection">
        <p className="section-kicker">{label(locale, 'ui.availableCrimes', 'Available crimes')}</p>
        <div className="menu-list">
          {crimes.map((crime) => {
            const tooYoung = life.character.age < crime.minAge;
            const locked = tooYoung || lockedByPrison;
            return (
              <button
                className={`menu-row action-row${locked ? ' is-disabled' : ''}`}
                disabled={locked}
                key={crime.id}
                type="button"
                onClick={() => onAttemptCrime(crime.id)}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl('fluent-emoji-flat:police-car-light')} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(locale, crime.titleKey)}</span>
                  <span className="menu-subtitle">{summary(locale, crime.summaryKey)}</span>
                  {tooYoung && (
                    <span className="locked-note">
                      {translate(locale, 'ui.locked.availableAtAge', { age: crime.minAge })}
                    </span>
                  )}
                  {lockedByPrison && <span className="locked-note">{label(locale, 'ui.locked.inPrison', 'In prison')}</span>}
                </span>
                <span className="menu-row-price">{formatRisk(crime.successChance)}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatRisk(successChance: number): string {
  return `${Math.round(successChance * 100)}%`;
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
