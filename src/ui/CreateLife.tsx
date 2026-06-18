import { useState } from 'react';
import { countries } from '../content/countries';
import type { Gender, Locale } from '../game/types';
import { translate } from '../i18n';
import { LocaleSwitcher } from './LocaleSwitcher';

interface CreateLifeProps {
  locale: Locale;
  onCreate(input: { name: string; gender: Gender; countryId: string }): void;
  onLocaleChange(locale: Locale): void;
}

const GENDERS: Array<{ value: Gender; labelKey: string }> = [
  { value: 'female', labelKey: 'gender.female' },
  { value: 'male', labelKey: 'gender.male' },
  { value: 'non_binary', labelKey: 'gender.nonBinary' },
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
            <h1>{translate(locale, 'ui.heading.newLife')}</h1>
          </div>
          <LocaleSwitcher locale={locale} onLocaleChange={onLocaleChange} />
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
            <span>{translate(locale, 'ui.label.name')}</span>
            <input
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="field-label">
            <span>{translate(locale, 'ui.label.gender')}</span>
            <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
              {GENDERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {translate(locale, item.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            <span>{translate(locale, 'ui.label.country')}</span>
            <select value={countryId} onChange={(event) => setCountryId(event.target.value)}>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {translate(locale, country.nameKey)}
                </option>
              ))}
            </select>
          </label>

          <button className="primary-button" type="submit">
            {translate(locale, 'ui.action.createLife')}
          </button>
        </form>
      </section>
    </main>
  );
}
