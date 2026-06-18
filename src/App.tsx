import { useEffect } from 'react';
import { translate } from './i18n';
import { useLifeStore, type ActiveTab } from './store/lifeStore';
import { ActivityPanel } from './ui/ActivityPanel';
import { CreateLife } from './ui/CreateLife';
import { Dashboard } from './ui/Dashboard';
import { DeathSummary } from './ui/DeathSummary';
import { RelationshipsPanel } from './ui/RelationshipsPanel';
import { SchoolWorkPanel } from './ui/SchoolWorkPanel';
import { Tabs } from './ui/Tabs';

export function App() {
  const {
    activeTab,
    ageUpLife,
    chooseEvent,
    clearLife,
    createLife,
    life,
    loadLife,
    locale,
    runActivity,
    setActiveTab,
    setLocale,
  } = useLifeStore();

  useEffect(() => {
    loadLife();
  }, [loadLife]);

  if (life === null) {
    return <CreateLife locale={locale} onCreate={createLife} onLocaleChange={setLocale} />;
  }

  if (!life.character.alive) {
    return <DeathSummary life={life} onNewLife={clearLife} />;
  }

  return (
    <main className="app-shell game-shell">
      {activeTab === 'life' && <Dashboard life={life} onAgeUp={ageUpLife} onChoose={chooseEvent} />}
      {activeTab === 'relationships' && <RelationshipsPanel life={life} />}
      {activeTab === 'schoolWork' && <SchoolWorkPanel life={life} />}
      {activeTab === 'activities' && <ActivityPanel life={life} onRun={runActivity} />}
      {activeTab === 'profile' && (
        <section className="panel">
          <p className="panel-title">{life.character.name}</p>
          <dl className="detail-list">
            <div>
              <dt>{translate(locale, 'ui.label.country')}</dt>
              <dd>{translate(locale, `country.${life.character.countryId}`)}</dd>
            </div>
            <div>
              <dt>{locale === 'zh-CN' ? '状态' : 'Status'}</dt>
              <dd>{life.statuses.length === 0 ? (locale === 'zh-CN' ? '稳定' : 'Stable') : life.statuses.join(', ')}</dd>
            </div>
          </dl>
        </section>
      )}
      <Tabs activeTab={activeTab} locale={locale} onTabChange={(tab: ActiveTab) => setActiveTab(tab)} />
    </main>
  );
}
