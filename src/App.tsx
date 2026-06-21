import { useEffect, useState } from 'react';
import { migrateLifeState } from './game/migrations';
import type { Locale } from './game/types';
import { PASS_EVENT_CHOICE_ID } from './game/types';
import { translate } from './i18n';
import { useLifeStore, type ActiveTab } from './store/lifeStore';
import { ActivityPanel } from './ui/ActivityPanel';
import { CreateLife } from './ui/CreateLife';
import { Dashboard } from './ui/Dashboard';
import { DeathSummary } from './ui/DeathSummary';
import { EventModal } from './ui/EventModal';
import { GameHeader } from './ui/GameHeader';
import { LocaleSwitcher } from './ui/LocaleSwitcher';
import { AchievementsPanel } from './ui/panels/AchievementsPanel';
import { AssetsPanel } from './ui/panels/AssetsPanel';
import { ProfilePanel } from './ui/ProfilePanel';
import { RelationshipsPanel } from './ui/RelationshipsPanel';
import { SchoolWorkPanel } from './ui/SchoolWorkPanel';
import { StatusBars } from './ui/StatusBars';
import { Tabs } from './ui/Tabs';

export function App() {
  const {
    activeTab,
    adoptChild,
    ageUpLife,
    applyForCareer,
    askOnDate,
    buyAsset,
    chooseEvent,
    chooseJob,
    clearLife,
    continueLife,
    createLife,
    divorceSpouse,
    enrollInProgram,
    interactRelationship,
    life,
    loadLife,
    locale,
    marryPartner,
    runActivity,
    savedLife,
    setActiveTab,
    setLocale,
    sellAsset,
  } = useLifeStore();
  const [eventResult, setEventResult] = useState<{ lifeId: string; textKey: string } | null>(null);
  const loadedLifeId = life?.character.id ?? null;

  useEffect(() => {
    loadLife();
  }, [loadLife]);

  useEffect(() => {
    setEventResult(null);
  }, [loadedLifeId]);

  if (life === null) {
    return (
      <CreateLife
        hasSavedLife={savedLife !== null}
        locale={locale}
        onContinue={continueLife}
        onCreate={createLife}
        onLocaleChange={setLocale}
      />
    );
  }

  const activeLife = migrateLifeState(life);

  if (!activeLife.character.alive) {
    return <DeathSummary life={activeLife} onLocaleChange={setLocale} onNewLife={clearLife} />;
  }

  const hasPendingEvent = activeLife.currentEvent !== null;
  const eventResultTextKey = eventResult?.lifeId === activeLife.character.id ? eventResult.textKey : null;
  const handleChooseEvent = (choiceId: string) => {
    const event = activeLife.currentEvent;

    if (event === null) {
      return;
    }

    const resultKey =
      choiceId === PASS_EVENT_CHOICE_ID ? 'log.eventPassed' : event.choices.find((choice) => choice.id === choiceId)?.resultKey;

    chooseEvent(choiceId);

    if (resultKey !== undefined) {
      setEventResult({ lifeId: activeLife.character.id, textKey: resultKey });
    }
  };

  return (
    <main className={`app-shell game-shell game-shell--${activeTab}`}>
      <GameHeader activeTab={activeTab} life={activeLife} onHome={() => setActiveTab('life')} />
      <div className="screen-area">
        {activeTab === 'life' && (
          <div className="screen-stack screen-stack--life">
            <Dashboard life={activeLife} onChoose={handleChooseEvent} />
          </div>
        )}
        {activeTab === 'relationships' && (
          <RelationshipsPanel
            life={activeLife}
            onAdopt={adoptChild}
            onAskOnDate={askOnDate}
            onDivorce={divorceSpouse}
            onInteract={interactRelationship}
            onMarry={marryPartner}
          />
        )}
        {activeTab === 'schoolWork' && (
          <SchoolWorkPanel life={activeLife} onApplyForCareer={applyForCareer} onEnroll={enrollInProgram} />
        )}
        {activeTab === 'activities' && <ActivityPanel life={activeLife} onChooseJob={chooseJob} onRun={runActivity} />}
        {activeTab === 'profile' && (
          <div className="screen-stack">
            <section className="panel">
              <div className="profile-header">
                <p className="panel-title">{activeLife.character.name}</p>
                <LocaleSwitcher locale={locale} onLocaleChange={setLocale} />
              </div>
              <dl className="detail-list">
                <div>
                  <dt>{translate(locale, 'ui.label.country')}</dt>
                  <dd>{translate(locale, `country.${activeLife.character.countryId}`)}</dd>
                </div>
                <div>
                  <dt>{translate(locale, 'ui.label.status')}</dt>
                  <dd>{formatStatuses(activeLife.statuses, locale)}</dd>
                </div>
              </dl>
            </section>
            <ProfilePanel life={activeLife} />
            <AssetsPanel life={activeLife} onBuyAsset={buyAsset} onSellAsset={sellAsset} />
            <AchievementsPanel life={activeLife} />
          </div>
        )}
      </div>
      <div className="bottom-hud">
        <Tabs
          activeTab={activeTab}
          ageUpDisabled={hasPendingEvent}
          locale={locale}
          onAgeUp={ageUpLife}
          onTabChange={(tab: ActiveTab) => setActiveTab(tab)}
        />
        <div className="bottom-status-panel">
          <StatusBars attributes={activeLife.character.attributes} locale={locale} />
        </div>
      </div>
      <EventModal
        event={activeLife.currentEvent}
        locale={locale}
        resultTextKey={eventResultTextKey}
        onChoose={handleChooseEvent}
        onDismissResult={() => setEventResult(null)}
      />
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
