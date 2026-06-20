import type { CatalogItem } from './catalogTypes';

export function validateCatalogIds(items: CatalogItem[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const reportedIds = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id) && !reportedIds.has(item.id)) {
      errors.push(`Duplicate catalog id: ${item.id}`);
      reportedIds.add(item.id);
    }

    seenIds.add(item.id);
  }

  return errors;
}

export function validateSourceRefs(items: CatalogItem[]): string[] {
  return items
    .filter((item) => item.sourceRefs.length === 0)
    .map((item) => `Missing sourceRefs for catalog id: ${item.id}`);
}

export function validateLocaleKeys(
  items: CatalogItem[],
  zhCN: Record<string, string>,
  enUS: Record<string, string>,
): string[] {
  const errors: string[] = [];

  for (const item of items) {
    if (!(item.titleKey in zhCN)) {
      errors.push(`Missing zh-CN locale key for catalog id ${item.id}: ${item.titleKey}`);
    }
  }

  for (const item of items) {
    if (!(item.titleKey in enUS)) {
      errors.push(`Missing en-US locale key for catalog id ${item.id}: ${item.titleKey}`);
    }
  }

  return errors;
}
