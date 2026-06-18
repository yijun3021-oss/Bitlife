import type { LifeState } from '../game/types';
import { translate } from '../i18n';

interface RelationshipsPanelProps {
  life: LifeState;
}

export function RelationshipsPanel({ life }: RelationshipsPanelProps) {
  return (
    <section className="panel">
      <p className="panel-title">{life.locale === 'zh-CN' ? '家庭关系' : translate(life.locale, 'ui.label.relationships')}</p>
      <div className="list-stack">
        {life.relationships.map((relationship) => (
          <article className="row-panel" key={relationship.id}>
            <div>
              <h2>{relationship.name}</h2>
              <p>{relationshipLabel(relationship.type, life.locale)}</p>
            </div>
            <strong>{relationship.closeness}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function relationshipLabel(type: LifeState['relationships'][number]['type'], locale: LifeState['locale']): string {
  const labels = {
    mother: locale === 'zh-CN' ? '母亲' : 'Mother',
    father: locale === 'zh-CN' ? '父亲' : 'Father',
    sibling: locale === 'zh-CN' ? '手足' : 'Sibling',
  };
  return labels[type];
}
