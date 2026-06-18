import type { Locale } from '../game/types';
import { translate } from '../i18n';
import type { ActiveTab } from '../store/lifeStore';

interface TabsProps {
  activeTab: ActiveTab;
  locale: Locale;
  onTabChange(tab: ActiveTab): void;
}

const TABS: ActiveTab[] = ['life', 'relationships', 'schoolWork', 'activities', 'profile'];

export function Tabs({ activeTab, locale, onTabChange }: TabsProps) {
  return (
    <nav className="bottom-tabs" aria-label={locale === 'zh-CN' ? '主导航' : 'Main navigation'}>
      {TABS.map((tab) => (
        <button
          aria-current={activeTab === tab ? 'page' : undefined}
          className="tab-button"
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
        >
          {translate(locale, `ui.tab.${tab}`)}
        </button>
      ))}
    </nav>
  );
}
