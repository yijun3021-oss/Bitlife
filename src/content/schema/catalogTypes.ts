import type { Attributes } from '../../game/types';
import type { SourceRef } from './sourceRefs';

export interface RequirementConfig {
  minAge?: number;
  maxAge?: number;
  minAttributes?: Partial<Attributes>;
  maxAttributes?: Partial<Attributes>;
  requiredStatuses?: string[];
  excludedStatuses?: string[];
}

export interface EffectConfig {
  attributes?: Partial<Attributes>;
  money?: number;
  addStatus?: string;
  removeStatus?: string;
}

export interface CatalogItem {
  id: string;
  titleKey: string;
  summaryKey?: string;
  descriptionKey?: string;
  requirements?: RequirementConfig;
  effects?: EffectConfig;
  sourceRefs: SourceRef[];
}
