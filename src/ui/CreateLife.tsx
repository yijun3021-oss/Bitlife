import { useState } from 'react';
import { countries } from '../content/countries';
import type { Gender, Locale } from '../game/types';
import { translate } from '../i18n';

interface CreateLifeProps {
  locale: Locale;
  onCreate(input: { name: string; gender: Gender; countryId: string }): void;
  onLocaleChange(locale: Locale): void;
}

const GENDERS: Array<{ value: Gender; zh: string; en: string }> = [
  { value: 'female', zh: '女', en: 'Female' },
  { value: 'male', zh: '男', en: 'Male' },
  { value: 'non_binary', zh: '非二元', en: 'Non-binary' },
];

export function CreateLife({ locale, onCreate, onLocaleChange }: CreateLifeProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [countryId, setCountryId] = useState('cn');

  return (
    <main className="app-shell start-shell">
      <section className="panel create-panel">
        <div className="create-header">
          <div>
            <p className="eyebrow">Bitliffe</p>
            <h1>{locale === 'zh-CN' ? '新人生' : 'New life'}</h1>
          </div>
          <div className="segmented-control" aria-label={locale === 'zh-CN' ? '语言' : 'Language'}>
            <button
              aria-pressed={locale === 'zh-CN'}
              type="button"
              onClick={() => onLocaleChange('zh-CN')}
            >
              中文
            </button>
            <button
              aria-pressed={locale === 'en-US'}
              type="button"
              onClick={() => onLocaleChange('en-US')}
            >
              EN
            </button>
          </div>
        </div>

        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmedName = name.trim();
            if (trimmedName.length === 0) {
              return;
            }
            onCreate({ name: trimmedName, gender, countryId });
          }}
        >
          <label className="field-label">
            <span>{locale === 'zh-CN' ? '姓名' : 'Name'}</span>
            <input
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="field-label">
            <span>{locale === 'zh-CN' ? '性别' : 'Gender'}</span>
            <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
              {GENDERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {locale === 'zh-CN' ? item.zh : item.en}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            <span>{locale === 'zh-CN' ? '国家' : 'Country'}</span>
            <select value={countryId} onChange={(event) => setCountryId(event.target.value)}>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {countryLabel(country.id, locale, country.nameKey)}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" type="submit">
            {locale === 'zh-CN' ? '创建人生' : translate(locale, 'ui.action.createLife')}
          </button>
        </form>
      </section>
    </main>
  );
}

function countryLabel(countryId: string, locale: Locale, nameKey: string): string {
  if (locale !== 'zh-CN') {
    return translate(locale, nameKey);
  }

  const labels: Record<string, string> = {
    cn: '中国',
    us: '美国',
    jp: '日本',
  };
  return labels[countryId] ?? translate(locale, nameKey);
}
