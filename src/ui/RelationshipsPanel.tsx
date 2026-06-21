import type { LifeStateV2 } from '../game/lifeStateV2';
import type { RelationshipActionId } from '../game/types';
import { translate } from '../i18n';

interface RelationshipsPanelProps {
  life: LifeStateV2;
  onAdopt(child: { id: string; name: string }): void;
  onAskOnDate(relationshipId: string): void;
  onInteract(relationshipId: string, actionId: RelationshipActionId): void;
  onDivorce(): void;
  onMarry(relationshipId: string): void;
}

const relationshipActions: Array<{ id: RelationshipActionId; labelKey: string }> = [
  { id: 'talk', labelKey: 'ui.relationshipAction.talk' },
  { id: 'spend_time', labelKey: 'ui.relationshipAction.spendTime' },
  { id: 'argue', labelKey: 'ui.relationshipAction.argue' },
];

export function RelationshipsPanel({ life, onAdopt, onAskOnDate, onDivorce, onInteract, onMarry }: RelationshipsPanelProps) {
  const latestLog = life.log[0];
  const feedback = latestLog?.textKey === 'log.relationshipInteraction'
    ? translate(life.locale, latestLog.textKey, latestLog.values)
    : null;

  return (
    <section className="panel">
      <p className="panel-title">{translate(life.locale, 'ui.label.relationships')}</p>
      {feedback !== null && (
        <div className="feedback-panel" role="status">
          <strong>{translate(life.locale, 'ui.label.latestResult')}</strong>
          <p>{feedback}</p>
        </div>
      )}
      <div className="menu-list">
        {life.relationships.map((relationship) => (
          <article className="menu-row relationship-row" key={relationship.id}>
            <span className="menu-icon-wrap">
              <img aria-hidden="true" className="menu-icon" src={iconUrl(relationship.type)} alt="" />
            </span>
            <div className="menu-copy">
              <h2 className="menu-title">
                {relationship.name} <span>({relationshipLabel(relationship.type, life.locale)})</span>
              </h2>
              <p className="menu-subtitle">{translate(life.locale, 'ui.label.relationships')}</p>
              <div className="relationship-meter" aria-hidden="true">
                <span style={{ width: `${relationship.closeness}%` }} />
              </div>
              <div className="relationship-actions">
                {relationshipActions.map((action) => (
                  <button
                    className="relationship-action-button"
                    key={action.id}
                    type="button"
                    onClick={() => onInteract(relationship.id, action.id)}
                  >
                    {translate(life.locale, action.labelKey)}
                  </button>
                ))}
                {relationship.type === 'friend' && (
                  <button className="relationship-action-button" type="button" onClick={() => onAskOnDate(relationship.id)}>
                    {label(life.locale, 'ui.action.date', 'Date')}
                  </button>
                )}
                {relationship.type === 'partner' && (
                  <button className="relationship-action-button" type="button" onClick={() => onMarry(relationship.id)}>
                    {label(life.locale, 'ui.action.marry', 'Marry')}
                  </button>
                )}
                {life.family.spouseId === relationship.id && (
                  <button className="relationship-action-button relationship-action-button--danger" type="button" onClick={onDivorce}>
                    {label(life.locale, 'ui.action.divorce', 'Divorce')}
                  </button>
                )}
              </div>
            </div>
            <img aria-hidden="true" className="menu-chevron" src="https://api.iconify.design/material-symbols:chevron-right-rounded.svg" alt="" />
          </article>
        ))}
      </div>
      <div className="panel-subsection relationship-footer-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => onAdopt({ id: `child_${life.character.age}_${life.family.childrenIds.length}`, name: label(life.locale, 'ui.defaultChildName', 'Adopted Child') })}
        >
          {label(life.locale, 'ui.action.adoptChild', 'Adopt child')}
        </button>
      </div>
    </section>
  );
}

function relationshipLabel(type: LifeStateV2['relationships'][number]['type'], locale: LifeStateV2['locale']): string {
  return translate(locale, `relationship.${type}`);
}

function iconUrl(type: LifeStateV2['relationships'][number]['type']): string {
  const icon =
    type === 'mother' ? 'fluent-emoji-flat:woman'
    : type === 'father' ? 'fluent-emoji-flat:man'
    : type === 'partner' || type === 'spouse' ? 'fluent-emoji-flat:couple-with-heart'
    : type === 'child' ? 'fluent-emoji-flat:child'
    : 'fluent-emoji-flat:person';
  return `https://api.iconify.design/${icon}.svg`;
}

function label(locale: LifeStateV2['locale'], key: string, fallback: string): string {
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}
