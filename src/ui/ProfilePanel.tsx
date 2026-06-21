import { careers } from '../content/catalog/careers';
import { educationPrograms } from '../content/catalog/education';
import type { LicenseKind, LifeStateV2 } from '../game/lifeStateV2';
import { translate } from '../i18n';

interface ProfilePanelProps {
  life: LifeStateV2;
}

const licenseLabels: Record<LicenseKind, string> = {
  driving: 'Driving',
  boat: 'Boat',
  flight: 'Flight',
};

export function ProfilePanel({ life }: ProfilePanelProps) {
  const { character, family, locale } = life;
  const education = educationLabel(life);
  const career = careerLabel(life);
  const spouse = family.spouseId === null
    ? '-'
    : life.relationships.find((relationship) => relationship.id === family.spouseId)?.name ?? '-';
  const licenses = (Object.entries(life.licenses) as Array<[LicenseKind, boolean]>)
    .filter(([, obtained]) => obtained)
    .map(([license]) => label(locale, `license.${license}`, licenseLabels[license]));

  return (
    <section className="panel" aria-labelledby="profile-heading">
      <h2 className="panel-title" id="profile-heading">
        {label(locale, 'ui.profile', 'Profile')}
      </h2>
      <dl className="detail-list">
        <div>
          <dt>{translate(locale, 'ui.label.age')}</dt>
          <dd>{character.age}</dd>
        </div>
        <div>
          <dt>{translate(locale, 'ui.label.money')}</dt>
          <dd>{formatMoney(character.money)}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.education', 'Education')}</dt>
          <dd>{education}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.career', 'Career')}</dt>
          <dd>{career}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.spouse', 'Spouse')}</dt>
          <dd>{spouse}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.children', 'Children')}</dt>
          <dd>{family.childrenIds.length}</dd>
        </div>
        <div>
          <dt>{label(locale, 'ui.licenses', 'Licenses')}</dt>
          <dd>{licenses.length === 0 ? '-' : licenses.join(', ')}</dd>
        </div>
      </dl>
    </section>
  );
}

function educationLabel(life: LifeStateV2): string {
  if (life.education.majorId !== null) {
    const program = educationPrograms.find((item) => item.id === life.education.majorId);
    const title = program === undefined ? life.education.majorId : translate(life.locale, program.titleKey);
    return life.education.graduated ? `${title} (${label(life.locale, 'ui.graduated', 'graduated')})` : title;
  }

  return translate(life.locale, `schoolStage.${life.school.stage}`);
}

function careerLabel(life: LifeStateV2): string {
  if (life.career.currentJobId !== null) {
    const career = careers.find((item) => item.id === life.career.currentJobId);
    return career === undefined ? life.career.currentJobId : translate(life.locale, career.titleKey);
  }

  if (life.job !== null) {
    return translate(life.locale, life.job.titleKey);
  }

  return '-';
}

function label(locale: LifeStateV2['locale'], key: string, fallback: string): string {
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}

function formatMoney(value: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}
