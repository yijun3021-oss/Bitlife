import { getLifeStage } from '../game/engine';
import type { LifeState } from '../game/types';
import { translate } from '../i18n';
import type { ActiveTab } from '../store/lifeStore';

interface GameHeaderProps {
  activeTab: ActiveTab;
  life: LifeState;
  onHome(): void;
}

export function GameHeader({ activeTab, life, onHome }: GameHeaderProps) {
  const titleKey = activeTab === 'life' ? 'ui.title.simulation' : `ui.tab.${activeTab}`;
  const title = translate(life.locale, titleKey);
  const playerStrip = <PlayerStrip life={life} />;
  const titleBar = <TitleBar activeTab={activeTab} title={title} onHome={onHome} />;

  return (
    <header className={`game-header${activeTab === 'life' ? ' game-header--life' : ''}`}>
      {activeTab === 'life' ? titleBar : playerStrip}
      {activeTab === 'life' ? playerStrip : titleBar}
    </header>
  );
}

function PlayerStrip({ life }: { life: LifeState }) {
  const stage = getLifeStage(life.character.age);

  return (
    <div className="player-strip">
      <img aria-hidden="true" className="player-avatar" src={avatarUrl(stage)} alt="" />
      <div className="player-copy">
        <div className="player-name-line">
          <span className="player-name">{life.character.name}</span>
          <img aria-hidden="true" className="info-icon" src={iconUrl('material-symbols:info-rounded')} alt="" />
        </div>
        <span className="player-stage">{translate(life.locale, `lifeStage.${stage}`)}</span>
      </div>
      <div className="bank-balance">
        <strong>{formatMoney(life.character.money)}</strong>
        <span>{translate(life.locale, 'ui.label.bankBalance')}</span>
      </div>
    </div>
  );
}

function TitleBar({ activeTab, title, onHome }: { activeTab: ActiveTab; title: string; onHome(): void }) {
  return (
    <div className="screen-titlebar">
      <button className="titlebar-button" type="button" aria-label="Life" onClick={onHome}>
        <img
          aria-hidden="true"
          className="titlebar-icon"
          src={iconUrl(activeTab === 'life' ? 'material-symbols:menu-rounded' : 'material-symbols:close-rounded')}
          alt=""
        />
      </button>
      <span className="screen-title">{title}</span>
    </div>
  );
}

function avatarUrl(stage: ReturnType<typeof getLifeStage>): string {
  if (stage === 'infant') {
    return iconUrl('fluent-emoji-flat:baby');
  }
  if (stage === 'elder') {
    return iconUrl('fluent-emoji-flat:older-person');
  }
  return iconUrl('fluent-emoji-flat:person');
}

function iconUrl(icon: string): string {
  return `https://api.iconify.design/${icon}.svg`;
}

function formatMoney(value: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}
