import type { CatalogItem, EffectConfig } from '../schema/catalogTypes';

export type RelationshipEventType = 'family' | 'friend' | 'romance';

export interface RelationshipEventCatalogItem extends CatalogItem {
  type: RelationshipEventType;
  minAge: number;
  effects: EffectConfig;
}

export const relationshipEventConfigs: RelationshipEventCatalogItem[] = [
  {
    id: 'relationship.family_time',
    titleKey: 'catalog.relationship.familyTime.title',
    summaryKey: 'catalog.relationship.familyTime.summary',
    type: 'family',
    minAge: 3,
    effects: { attributes: { happiness: 4 } },
    sourceRefs: [{ sourceTitle: 'Relationships', sourcePage: 'Relationships', sourceSection: 'Spend Time' }],
  },
  {
    id: 'relationship.make_friend',
    titleKey: 'catalog.relationship.makeFriend.title',
    summaryKey: 'catalog.relationship.makeFriend.summary',
    type: 'friend',
    minAge: 6,
    effects: { attributes: { happiness: 3, smarts: 1 } },
    sourceRefs: [{ sourceTitle: 'Relationships', sourcePage: 'Relationships', sourceSection: 'Friends' }],
  },
  {
    id: 'relationship.first_date',
    titleKey: 'catalog.relationship.firstDate.title',
    summaryKey: 'catalog.relationship.firstDate.summary',
    type: 'romance',
    minAge: 16,
    effects: { attributes: { happiness: 5 } },
    sourceRefs: [{ sourceTitle: 'Dating App', sourcePage: 'Dating App' }],
  },
];
