import { achievements } from '../../content/catalog/achievements';
import type { LifeStateV2 } from '../../game/lifeStateV2';
import { translate } from '../../i18n';

interface AchievementsPanelProps {
  life: LifeStateV2;
}

export function AchievementsPanel({ life }: AchievementsPanelProps) {
  const { locale } = life;
  const unlocked = new Set(life.achievements.unlocked);

  return (
    <section className="panel" aria-labelledby="achievements-heading">
      <h2 className="panel-title" id="achievements-heading">
        {label(locale, 'ui.achievements', 'Achievements')}
      </h2>
      <div className="menu-list">
        {achievements.map((achievement) => {
          const isUnlocked = unlocked.has(achievement.id);
          return (
            <article className={`menu-row achievement-row${isUnlocked ? '' : ' is-disabled'}`} key={achievement.id}>
              <span className="menu-icon-wrap">
                <img aria-hidden="true" className="menu-icon" src={iconUrl(isUnlocked ? 'fluent-emoji-flat:trophy' : 'fluent-emoji-flat:locked')} alt="" />
              </span>
              <span className="menu-copy">
                <span className="menu-title">{translate(locale, achievement.titleKey)}</span>
                <span className="menu-subtitle">{isUnlocked ? achievement.id : summary(locale, achievement.summaryKey)}</span>
              </span>
              <span className="menu-row-price">
                {isUnlocked ? label(locale, 'ui.unlocked', 'Unlocked') : label(locale, 'ui.locked', 'Locked')}
              </span>
              <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
            </article>
          );
        })}
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
