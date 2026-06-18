import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { createNewLife } from '../game/engine';
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

    await userEvent.type(screen.getByLabelText('姓名'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: '创建人生' }));

    expect(screen.getByText('Mina Lin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '长大一岁' })).toBeInTheDocument();
  });

  it('shows all activities and lets the store own eligibility', async () => {
    render(<App />);

    await userEvent.type(screen.getByLabelText('姓名'), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: '创建人生' }));
    await userEvent.click(screen.getByRole('button', { name: '活动' }));

    expect(screen.getByRole('button', { name: '找工作' })).toBeInTheDocument();
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
});
