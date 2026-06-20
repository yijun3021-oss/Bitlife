import type { CatalogItem, EffectConfig } from '../schema/catalogTypes';

export type P1EventStage = 'child' | 'school' | 'adult' | 'elder';

export interface P1EventCatalogItem extends CatalogItem {
  stage: P1EventStage;
  weight: number;
  effects: EffectConfig;
}

export const p1Events: P1EventCatalogItem[] = [
  {
    id: 'p1_event.child_library_card',
    titleKey: 'catalog.event.childLibraryCard.title',
    summaryKey: 'catalog.event.childLibraryCard.summary',
    stage: 'child',
    weight: 4,
    effects: { attributes: { smarts: 3, happiness: 1 } },
    sourceRefs: [{ sourceTitle: 'Events/Childhood events', sourcePage: 'Events/Childhood events' }],
  },
  {
    id: 'p1_event.child_shared_snack',
    titleKey: 'catalog.event.childSharedSnack.title',
    summaryKey: 'catalog.event.childSharedSnack.summary',
    stage: 'child',
    weight: 3,
    effects: { attributes: { happiness: 2 } },
    sourceRefs: [{ sourceTitle: 'Events/Childhood events', sourcePage: 'Events/Childhood events' }],
  },
  {
    id: 'p1_event.school_group_project',
    titleKey: 'catalog.event.schoolGroupProject.title',
    summaryKey: 'catalog.event.schoolGroupProject.summary',
    stage: 'school',
    weight: 4,
    effects: { attributes: { smarts: 2, happiness: 1 } },
    sourceRefs: [{ sourceTitle: 'Education/Faculty Staff', sourcePage: 'Education/Faculty Staff' }],
  },
  {
    id: 'p1_event.school_bully_choice',
    titleKey: 'catalog.event.schoolBullyChoice.title',
    summaryKey: 'catalog.event.schoolBullyChoice.summary',
    stage: 'school',
    weight: 2,
    effects: { attributes: { happiness: 2 }, addStatus: 'civic' },
    sourceRefs: [{ sourceTitle: 'Events/Childhood events', sourcePage: 'Events/Childhood events' }],
  },
  {
    id: 'p1_event.work_extra_shift',
    titleKey: 'catalog.event.workExtraShift.title',
    summaryKey: 'catalog.event.workExtraShift.summary',
    stage: 'adult',
    weight: 4,
    effects: { money: 350, attributes: { health: -2, happiness: -1 } },
    sourceRefs: [{ sourceTitle: 'Careers/Job activities', sourcePage: 'Careers/Job activities' }],
  },
  {
    id: 'p1_event.relationship_old_friend',
    titleKey: 'catalog.event.relationshipOldFriend.title',
    summaryKey: 'catalog.event.relationshipOldFriend.summary',
    stage: 'adult',
    weight: 3,
    effects: { attributes: { happiness: 3 } },
    sourceRefs: [{ sourceTitle: 'Relationships', sourcePage: 'Relationships' }],
  },
  {
    id: 'p1_event.asset_unexpected_bill',
    titleKey: 'catalog.event.assetUnexpectedBill.title',
    summaryKey: 'catalog.event.assetUnexpectedBill.summary',
    stage: 'adult',
    weight: 3,
    effects: { money: -450, attributes: { happiness: -2 } },
    sourceRefs: [{ sourceTitle: 'Assets', sourcePage: 'Assets' }],
  },
  {
    id: 'p1_event.health_checkup_note',
    titleKey: 'catalog.event.healthCheckupNote.title',
    summaryKey: 'catalog.event.healthCheckupNote.summary',
    stage: 'adult',
    weight: 3,
    effects: { attributes: { health: 3, smarts: 1 } },
    sourceRefs: [{ sourceTitle: 'Medical Doctor', sourcePage: 'Medical Doctor' }],
  },
  {
    id: 'p1_event.crime_witness',
    titleKey: 'catalog.event.crimeWitness.title',
    summaryKey: 'catalog.event.crimeWitness.summary',
    stage: 'adult',
    weight: 2,
    effects: { attributes: { happiness: -2 }, addStatus: 'civic' },
    sourceRefs: [{ sourceTitle: 'Crime', sourcePage: 'Crime', sourceSection: 'Witnessing crimes' }],
  },
  {
    id: 'p1_event.elder_family_visit',
    titleKey: 'catalog.event.elderFamilyVisit.title',
    summaryKey: 'catalog.event.elderFamilyVisit.summary',
    stage: 'elder',
    weight: 4,
    effects: { attributes: { happiness: 4, health: 1 } },
    sourceRefs: [{ sourceTitle: 'Relationships', sourcePage: 'Relationships', sourceSection: 'Family' }],
  },
];
