import type { LifeState, RelationshipActionId } from '../game/types';
import { translate } from '../i18n';

interface RelationshipsPanelProps {
  life: LifeState;
  onInteract(relationshipId: string, actionId: RelationshipActionId): void;
}

const relationshipActions: Array<{ id: RelationshipActionId; labelKey: string }> = [
  { id: 'talk', labelKey: 'ui.relationshipAction.talk' },
  { id: 'spend_time', labelKey: 'ui.relationshipAction.spendTime' },
  { id: 'argue', labelKey: 'ui.relationshipAction.argue' },
];

export function RelationshipsPanel({ life, onInteract }: RelationshipsPanelProps) {
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
              </div>
            </div>
            <img aria-hidden="true" className="menu-chevron" src="https://api.iconify.design/material-symbols:chevron-right-rounded.svg" alt="" />
          </article>
        ))}
      </div>
    </section>
  );
}

function relationshipLabel(type: LifeState['relationships'][number]['type'], locale: LifeState['locale']): string {
  return translate(locale, `relationship.${type}`);
}

function iconUrl(type: LifeState['relationships'][number]['type']): string {
  const icon =
    type === 'mother' ? 'fluent-emoji-flat:woman'
    : type === 'father' ? 'fluent-emoji-flat:man'
    : 'fluent-emoji-flat:person';
  return `https://api.iconify.design/${icon}.svg`;
}
