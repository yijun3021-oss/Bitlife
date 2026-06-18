import type { Locale } from '../game/types';
import { translate } from '../i18n';

export type AppTab = 'life' | 'relationships' | 'schoolWork' | 'activities' | 'profile';

interface TabsProps {
  activeTab: AppTab;
  locale: Locale;
  onTabChange(tab: AppTab): void;
}

const TABS: AppTab[] = ['life', 'relationships', 'schoolWork', 'activities', 'profile'];

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
          {tabLabel(tab, locale)}
        </button>
      ))}
    </nav>
  );
}

function tabLabel(tab: AppTab, locale: Locale): string {
  if (locale !== 'zh-CN') {
    return translate(locale, `ui.tab.${tab}`);
  }

  const labels: Record<AppTab, string> = {
    life: '人生',
    relationships: '关系',
    schoolWork: '学业工作',
    activities: '活动',
    profile: '档案',
  };
  return labels[tab];
}
