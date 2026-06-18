import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { createNewLife } from '../game/engine';
import type { LifeState } from '../game/types';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('App', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
  });

  it('creates a life and shows the dashboard', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    expect(screen.getByText('Mina Lin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Age up' })).toBeInTheDocument();
  });

  it('hides adult-only activities from an underage life', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));
    await userEvent.click(screen.getByRole('button', { name: 'Activities' }));

    expect(screen.queryByRole('button', { name: 'Find job' })).not.toBeInTheDocument();
  });

  it('shows find job for adults and hides it after employment', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({ locale: 'en-US', life: adult, activeTab: 'activities' });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Find job' }));

    expect(useLifeStore.getState().life?.job).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Find job' })).not.toBeInTheDocument();
  });

  it('disables age up while a yearly event is waiting for a choice', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    expect(screen.getByRole('button', { name: 'Age up' })).toBeDisabled();
  });

  it('uses English form labels and actions after switching language', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('heading', { name: 'New life' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Name'), 'Alex Reed');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    expect(screen.getByText('Alex Reed')).toBeInTheDocument();
  });

  it('switches language from the profile after creating a life', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Alex Reed');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));
    await userEvent.click(screen.getByRole('button', { name: 'Profile' }));
    const languageControl = screen.getByLabelText('Language');

    await userEvent.click(within(languageControl).getAllByRole('button')[0]);

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life?.locale).toBe('zh-CN');
  });

  it('switches language from the profile after loading a saved life', async () => {
    const savedLife = makeLife({ age: 18, locale: 'en-US' });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));
    render(<App />);

    expect(await screen.findByText('Mina Lin')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Profile' }));
    const languageControl = screen.getByLabelText('Language');

    await userEvent.click(within(languageControl).getAllByRole('button')[0]);

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life?.locale).toBe('zh-CN');
  });

  it('switches language from the death summary', async () => {
    const deadLife = makeLife({ age: 88, locale: 'en-US', alive: false });
    useLifeStore.setState({ locale: 'en-US', life: deadLife });
    render(<App />);
    const languageControl = screen.getByLabelText('Language');

    await userEvent.click(within(languageControl).getAllByRole('button')[0]);

    expect(useLifeStore.getState().locale).toBe('zh-CN');
    expect(useLifeStore.getState().life?.locale).toBe('zh-CN');
  });

  it('translates known statuses instead of showing internal codes', () => {
    const life = createNewLife({
      name: 'Alex Reed',
      gender: 'female',
      countryId: 'us',
      locale: 'en-US',
      seed: 'status-test',
    });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...life, statuses: ['injured'] },
      activeTab: 'profile',
    });

    render(<App />);

    expect(screen.getByText('Injured')).toBeInTheDocument();
    expect(screen.queryByText(/injured/)).not.toBeInTheDocument();
  });

  it('uses a localized fallback for unknown statuses', () => {
    const life = createNewLife({
      name: 'Alex Reed',
      gender: 'female',
      countryId: 'us',
      locale: 'en-US',
      seed: 'unknown-status-test',
    });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...life, statuses: ['mystery_status'] },
      activeTab: 'profile',
    });

    render(<App />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.queryByText('mystery_status')).not.toBeInTheDocument();
  });
});

function makeLife({
  age,
  alive = true,
  locale,
}: {
  age: number;
  alive?: boolean;
  locale: LifeState['locale'];
}): LifeState {
  const life = createNewLife({
    name: 'Mina Lin',
    gender: 'female',
    countryId: 'us',
    locale,
    seed: `app-test-${age}-${locale}`,
  });

  return {
    ...life,
    character: { ...life.character, age, alive },
    school: age < 18 ? life.school : { stage: 'finished', grade: 0, stress: 0 },
    currentEvent: null,
    deathSummary: alive
      ? null
      : { age, causeKey: 'death.oldAge', netWorth: life.character.money, logKey: 'log.death' },
  };
}
