import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('P1 app integration', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    useLifeStore.setState(useLifeStore.getInitialState(), true);
    useLifeStore.getState().setLocale('en-US');
  });

  it('shows P1 panels after life creation', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: /create life/i }));
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /assets/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /health/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /crime/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /achievements/i })).toBeInTheDocument();
  });

  it('keeps the four status bars in the fixed bottom area', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: /create life/i }));

    const statusBars = screen.getByRole('group', { name: /stats/i });

    expect(statusBars.closest('.bottom-status-panel')).not.toBeNull();
    expect(statusBars.closest('.life-dashboard')).toBeNull();
  });
});
