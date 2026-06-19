import { useState } from 'react';
import { countries } from '../content/countries';
import { familyNames, givenNames } from '../content/names';
import type { Gender, Locale } from '../game/types';
import { translate } from '../i18n';
import { LocaleSwitcher } from './LocaleSwitcher';

interface CreateLifeProps {
  hasSavedLife?: boolean;
  locale: Locale;
  onCreate(input: { name: string; gender: Gender; countryId: string }): void;
  onContinue?(): void;
  onLocaleChange(locale: Locale): void;
}

const GENDERS: Array<{ value: Gender; labelKey: string }> = [
  { value: 'female', labelKey: 'gender.female' },
  { value: 'male', labelKey: 'gender.male' },
  { value: 'non_binary', labelKey: 'gender.nonBinary' },
];

export function CreateLife({
  hasSavedLife = false,
  locale,
  onContinue,
  onCreate,
  onLocaleChange,
}: CreateLifeProps) {
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
          {hasSavedLife && onContinue !== undefined && (
            <button className="primary-button" type="button" onClick={onContinue}>
              {translate(locale, 'ui.action.continueLife')}
            </button>
          )}
          <div className="field-label">
            <label htmlFor="life-name">{translate(locale, 'ui.label.name')}</label>
            <span className="field-row">
              <input
                autoComplete="name"
                id="life-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button className="secondary-button" type="button" onClick={() => setName(randomName())}>
                {translate(locale, 'ui.action.randomName')}
              </button>
            </span>
          </div>

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

function randomName(): string {
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)] ?? givenNames[0];
  const familyName = familyNames[Math.floor(Math.random() * familyNames.length)] ?? familyNames[0];
  return `${givenName} ${familyName}`;
}
