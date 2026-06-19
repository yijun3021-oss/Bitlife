import type { Locale } from '../game/types';
import { translate } from '../i18n';
import type { ActiveTab } from '../store/lifeStore';

interface TabsProps {
  activeTab: ActiveTab;
  ageUpDisabled: boolean;
  locale: Locale;
  onAgeUp(): void;
  onTabChange(tab: ActiveTab): void;
}

const TABS: ActiveTab[] = ['relationships', 'schoolWork', 'life', 'activities', 'profile'];

export function Tabs({ activeTab, ageUpDisabled, locale, onAgeUp, onTabChange }: TabsProps) {
  return (
    <nav className="bottom-tabs" aria-label={translate(locale, 'ui.a11y.mainNavigation')}>
      {TABS.map((tab) => {
        if (tab === 'life') {
          return (
            <button
              aria-label={translate(locale, 'ui.action.ageUp')}
              className="tab-button tab-button--age"
              disabled={ageUpDisabled}
              key={tab}
              type="button"
              onClick={onAgeUp}
            >
              <img aria-hidden="true" className="tab-icon" src={iconUrl('material-symbols:add-rounded')} alt="" />
              <span>Age</span>
            </button>
          );
        }

        return (
          <button
            aria-current={activeTab === tab ? 'page' : undefined}
            className="tab-button"
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
          >
            <img aria-hidden="true" className="tab-icon" src={iconForTab(tab)} alt="" />
            <span>{translate(locale, `ui.tab.${tab}`)}</span>
          </button>
        );
      })}
    </nav>
  );
}

function iconForTab(tab: ActiveTab): string {
  if (tab === 'relationships') {
    return iconUrl('fluent-emoji-flat:two-hearts');
  }
  if (tab === 'schoolWork') {
    return iconUrl('fluent-emoji-flat:briefcase');
  }
  if (tab === 'activities') {
    return iconUrl('fluent-emoji-flat:speech-balloon');
  }
  return iconUrl('fluent-emoji-flat:card-index-dividers');
}

function iconUrl(icon: string): string {
  return `https://api.iconify.design/${icon}.svg`;
}
