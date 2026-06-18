import type { Locale } from '../game/types';
import { enUS } from './locales/en-US';
import { zhCN } from './locales/zh-CN';

export type TextKey = keyof typeof zhCN;

type Dictionary = Record<TextKey, string>;

const dictionaries: Record<Locale, Dictionary> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export function translate(
  locale: Locale,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const dictionary = dictionaries[locale] ?? enUS;
  const template = dictionary[key as TextKey] ?? enUS[key as TextKey] ?? key;

  return template.replace(/\{([^{}]+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}
