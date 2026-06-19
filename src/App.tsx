import { useEffect } from 'react';
import type { Locale } from './game/types';
import { translate } from './i18n';
import { useLifeStore, type ActiveTab } from './store/lifeStore';
import { ActivityPanel } from './ui/ActivityPanel';
import { CreateLife } from './ui/CreateLife';
import { Dashboard } from './ui/Dashboard';
import { DeathSummary } from './ui/DeathSummary';
import { LocaleSwitcher } from './ui/LocaleSwitcher';
import { RelationshipsPanel } from './ui/RelationshipsPanel';
import { SchoolWorkPanel } from './ui/SchoolWorkPanel';
import { Tabs } from './ui/Tabs';

export function App() {
  const {
    activeTab,
    ageUpLife,
    chooseEvent,
    chooseJob,
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
    return <DeathSummary life={life} onLocaleChange={setLocale} onNewLife={clearLife} />;
  }

  return (
    <main className="app-shell game-shell">
      {activeTab === 'life' && <Dashboard life={life} onAgeUp={ageUpLife} onChoose={chooseEvent} />}
      {activeTab === 'relationships' && <RelationshipsPanel life={life} />}
      {activeTab === 'schoolWork' && <SchoolWorkPanel life={life} />}
      {activeTab === 'activities' && <ActivityPanel life={life} onChooseJob={chooseJob} onRun={runActivity} />}
      {activeTab === 'profile' && (
        <section className="panel">
          <div className="profile-header">
            <p className="panel-title">{life.character.name}</p>
            <LocaleSwitcher locale={locale} onLocaleChange={setLocale} />
          </div>
          <dl className="detail-list">
            <div>
              <dt>{translate(locale, 'ui.label.country')}</dt>
              <dd>{translate(locale, `country.${life.character.countryId}`)}</dd>
            </div>
            <div>
              <dt>{translate(locale, 'ui.label.status')}</dt>
              <dd>{formatStatuses(life.statuses, locale)}</dd>
            </div>
          </dl>
        </section>
      )}
      <Tabs activeTab={activeTab} locale={locale} onTabChange={(tab: ActiveTab) => setActiveTab(tab)} />
    </main>
  );
}

function formatStatuses(statuses: string[], locale: Locale): string {
  if (statuses.length === 0) {
    return translate(locale, 'status.stable');
  }

  return statuses.map((status) => formatStatus(status, locale)).join(', ');
}

function formatStatus(status: string, locale: Locale): string {
  const key = `status.${status}`;
  const label = translate(locale, key);
  return label === key ? translate(locale, 'status.unknown') : label;
}
