import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { createNewLife } from '../game/engine';
import type { LifeStateV2 } from '../game/lifeStateV2';
import { migrateLifeState } from '../game/migrations';
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

  it('shows job options for adults and hides them after employment', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({ locale: 'en-US', life: adult, activeTab: 'activities' });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /Cashier/ }));

    expect(useLifeStore.getState().life?.job).not.toBeNull();
    expect(useLifeStore.getState().life?.career.currentJobId).toBe('career.cashier');
    expect(screen.queryByText('Cashier')).not.toBeInTheDocument();
  });

  it('shows crime as an adult activity', () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({ locale: 'en-US', life: adult, activeTab: 'activities' });

    render(<App />);

    expect(screen.getByText('Crime')).toBeInTheDocument();
  });

  it('covers representative adult activities from the downloaded wiki menu', () => {
    const adult = makeLife({ age: 21, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, character: { ...adult.character, money: 5000 } },
      activeTab: 'activities',
    });

    render(<App />);

    [
      'Adoption',
      'Casino',
      'Fame',
      'Horse Races',
      'Lottery',
      'Love',
      'Licenses',
      'Movie Theater',
      'Nightlife',
      'Royalty',
      'Salon & Spa',
      'Surrender',
      'Time Machine',
      'Vacation',
      'Will',
    ].forEach((activityName) => {
      expect(screen.getByText(activityName)).toBeInTheDocument();
    });
  });

  it('covers representative youth activities from the downloaded wiki menu', () => {
    const teen = makeLife({ age: 14, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...teen, character: { ...teen.character, money: 500 } },
      activeTab: 'activities',
    });

    render(<App />);

    ['Book', 'Identity', 'Martial Arts', 'Movie Theater', 'Optometrist', 'Space Camp', 'Walk'].forEach((activityName) => {
      expect(screen.getByText(activityName)).toBeInTheDocument();
    });
  });

  it('disables age up while a yearly event is waiting for a choice', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    expect(screen.getByRole('button', { name: 'Age up' })).toBeDisabled();
  });

  it('shows the current yearly event as a modal with at least two choices', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    const eventDialog = screen.getByRole('dialog', { name: 'This year' });
    expect(within(eventDialog).getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    expect(eventDialog.closest('.event-modal-backdrop')).not.toBeNull();
  });

  it('shows the yearly event result as a modal after choosing an option', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    const eventDialog = screen.getByRole('dialog', { name: 'This year' });
    await userEvent.click(within(eventDialog).getAllByRole('button')[0]);

    const resultDialog = screen.getByRole('dialog', { name: 'Result' });
    expect(resultDialog).toHaveTextContent('tap anywhere to continue');

    await userEvent.click(resultDialog);

    expect(screen.queryByRole('dialog', { name: 'Result' })).not.toBeInTheDocument();
  });

  it('records yearly event results in the central life timeline', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: 'Create life' }));

    const eventDialog = screen.getByRole('dialog', { name: 'This year' });
    await userEvent.click(within(eventDialog).getAllByRole('button')[0]);

    const resultDialog = screen.getByRole('dialog', { name: 'Result' });
    const resultMessage = resultDialog.querySelector('.event-modal-text')?.textContent;
    expect(resultMessage).toBeTruthy();

    await userEvent.click(resultDialog);

    const timeline = screen.getByRole('region', { name: 'Life timeline' });
    const history = timeline.querySelector('.life-timeline__entries');
    expect(history).not.toBeNull();
    expect(within(history as HTMLElement).getByText(resultMessage!)).toBeInTheDocument();
  });

  it('shows activity costs and gives feedback after running an activity', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, character: { ...adult.character, money: 500 }, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getByText('$200')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Rest/ }));

    expect(screen.getByText('You took time to rest.')).toBeInTheDocument();
  });

  it('records activity results in the central life timeline', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, character: { ...adult.character, money: 500 }, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /Rest/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Life' }));

    expect(within(getTimelineHistory()).getByText('You took time to rest.')).toBeInTheDocument();
  });

  it('locks rest for the current year and unlocks it after aging up', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /Rest/ }));

    expect(screen.getByRole('button', { name: /Rest/ })).toBeDisabled();
    expect(screen.getByText('Used this year')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Age up' }));
    await userEvent.click(screen.getByRole('button', { name: 'Activities' }));

    expect(screen.getByRole('button', { name: /Rest/ })).not.toBeDisabled();
  });

  it('locks study for the current year after it is used', async () => {
    const child = makeLife({ age: 6, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...child, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /Study/ }));

    expect(screen.getByRole('button', { name: /Study/ })).toBeDisabled();
    expect(screen.getByText('Used this year')).toBeInTheDocument();
  });

  it('shows job choices with salaries and lets adults choose one', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    expect(screen.getByText('Cashier')).toBeInTheDocument();
    expect(screen.getByText('$18,000/yr')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Cashier/ }));

    expect(useLifeStore.getState().life?.job?.jobId).toBe('cashier');
    expect(useLifeStore.getState().life?.career.currentJobId).toBe('career.cashier');
    expect(screen.queryByText('Cashier')).not.toBeInTheDocument();
  });

  it('hides legacy job choices when a P1 career is active', () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: {
        ...adult,
        career: { ...adult.career, currentJobId: 'career.cashier' },
        currentEvent: null,
        job: null,
      },
      activeTab: 'activities',
    });
    render(<App />);

    expect(screen.queryByText('Cashier')).not.toBeInTheDocument();
    expect(screen.queryByText('Office assistant')).not.toBeInTheDocument();
  });

  it('filters legacy job choices to P1-compatible careers', () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    expect(screen.getByText('Cashier')).toBeInTheDocument();
    expect(screen.getByText('Office assistant')).toBeInTheDocument();
    expect(screen.queryByText('Cook')).not.toBeInTheDocument();
    expect(screen.queryByText('Driver')).not.toBeInTheDocument();
    expect(screen.queryByText('Support agent')).not.toBeInTheDocument();
  });

  it('shows P1 career details in the work summary', () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: {
        ...adult,
        career: { currentJobId: 'career.cashier', performance: 61, yearsInRole: 3, retired: false },
        currentEvent: null,
        job: null,
      },
      activeTab: 'schoolWork',
    });
    render(<App />);

    const workPanel = screen.getByText('Work').closest('section');
    expect(workPanel).not.toBeNull();
    expect(within(workPanel!).queryByText('No job yet')).not.toBeInTheDocument();
    expect(within(workPanel!).getByText('Cashier')).toBeInTheDocument();
    expect(within(workPanel!).getByText('18,000')).toBeInTheDocument();
    expect(within(workPanel!).getByText('Performance')).toBeInTheDocument();
    expect(within(workPanel!).getByText('61')).toBeInTheDocument();
    expect(within(workPanel!).getByText('Years in role')).toBeInTheDocument();
    expect(within(workPanel!).getByText('3')).toBeInTheDocument();
  });

  it('records career changes in the central life timeline', async () => {
    const adult = makeLife({ age: 18, locale: 'en-US' });
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...adult, currentEvent: null },
      activeTab: 'activities',
    });
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /Cashier/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Life' }));

    expect(within(getTimelineHistory()).getByText('You accepted a new job.')).toBeInTheDocument();
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

  it('can fill a random name before creating a life', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    await userEvent.click(screen.getByRole('button', { name: 'Random name' }));

    expect(screen.getByLabelText('Name')).not.toHaveValue('');
  });

  it('shows a continue option for saved lives before entering the game', async () => {
    const savedLife = makeLife({ age: 18, locale: 'en-US' });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, locale: 'en-US', life: savedLife }));

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Continue life' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Continue life' }));

    expect(screen.getByText('Mina Lin')).toBeInTheDocument();
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

    await userEvent.click(await screen.findByRole('button', { name: 'Continue life' }));
    expect(screen.getByText('Mina Lin')).toBeInTheDocument();
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
    const life = migrateLifeState(createNewLife({
      name: 'Alex Reed',
      gender: 'female',
      countryId: 'us',
      locale: 'en-US',
      seed: 'status-test',
    }));
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
    const life = migrateLifeState(createNewLife({
      name: 'Alex Reed',
      gender: 'female',
      countryId: 'us',
      locale: 'en-US',
      seed: 'unknown-status-test',
    }));
    useLifeStore.setState({
      locale: 'en-US',
      life: { ...life, statuses: ['mystery_status'] },
      activeTab: 'profile',
    });

    render(<App />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.queryByText('mystery_status')).not.toBeInTheDocument();
  });

  it('lets players interact with family relationships', async () => {
    const life = makeLife({ age: 8, locale: 'en-US' });
    const mother = life.relationships.find((relationship) => relationship.type === 'mother');
    if (mother === undefined) {
      throw new Error('Expected mother relationship');
    }
    useLifeStore.setState({ locale: 'en-US', life, activeTab: 'relationships' });
    render(<App />);

    await userEvent.click(within(screen.getByText(new RegExp(mother.name)).closest('article')!).getByRole('button', { name: 'Talk' }));

    const updatedMother = useLifeStore.getState().life?.relationships.find((relationship) => relationship.id === mother.id);
    expect(updatedMother?.closeness).toBeGreaterThan(mother.closeness);
    expect(screen.getByText(/You talked with/)).toBeInTheDocument();
  });

  it('records relationship changes in the central life timeline', async () => {
    const life = makeLife({ age: 8, locale: 'en-US' });
    const mother = life.relationships.find((relationship) => relationship.type === 'mother');
    if (mother === undefined) {
      throw new Error('Expected mother relationship');
    }
    useLifeStore.setState({ locale: 'en-US', life, activeTab: 'relationships' });
    render(<App />);

    await userEvent.click(within(screen.getByText(new RegExp(mother.name)).closest('article')!).getByRole('button', { name: 'Talk' }));
    await userEvent.click(screen.getByRole('button', { name: 'Life' }));

    expect(within(getTimelineHistory()).getByText(/You talked with/)).toBeInTheDocument();
  });

  it('shows final relationships and timeline on the death summary', () => {
    const deadLife = makeLife({ age: 88, locale: 'en-US', alive: false });
    useLifeStore.setState({ locale: 'en-US', life: deadLife });

    render(<App />);

    expect(screen.getByText('Final relationships')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getAllByText(/Mother|Father/).length).toBeGreaterThan(0);
  });
});

function makeLife({
  age,
  alive = true,
  locale,
}: {
  age: number;
  alive?: boolean;
  locale: LifeStateV2['locale'];
}): LifeStateV2 {
  const life = createNewLife({
    name: 'Mina Lin',
    gender: 'female',
    countryId: 'us',
    locale,
    seed: `app-test-${age}-${locale}`,
  });

  return migrateLifeState({
    ...life,
    character: { ...life.character, age, alive },
    school: age < 18 ? life.school : { stage: 'finished', grade: 0, stress: 0 },
    currentEvent: null,
    deathSummary: alive
      ? null
      : { age, causeKey: 'death.oldAge', netWorth: life.character.money, logKey: 'log.death' },
  });
}

function getTimelineHistory(): HTMLElement {
  const timeline = screen.getByRole('region', { name: 'Life timeline' });
  const history = timeline.querySelector('.life-timeline__entries');
  if (!(history instanceof HTMLElement)) {
    throw new Error('Expected life timeline history');
  }

  return history;
}
