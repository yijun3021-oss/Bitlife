import { cleanup, render, screen, within } from '@testing-library/react';
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

    const timeline = screen.getByRole('region', { name: /life timeline/i });
    const statusBars = screen.getByRole('group', { name: /stats/i });

    expect(statusBars.closest('.bottom-status-panel')).not.toBeNull();
    expect(statusBars.closest('.life-dashboard')).toBeNull();
    expect(statusBars.closest('.life-timeline')).toBeNull();
    expect(timeline.closest('.bottom-status-panel')).toBeNull();
  });

  it('renders the central area as a scrollable life timeline with pending event context', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: /create life/i }));

    const timeline = screen.getByRole('region', { name: /life timeline/i });

    expect(timeline.closest('.screen-area')).not.toBeNull();
    expect(timeline.querySelector('.life-timeline__entries')).not.toBeNull();
    expect(timeline.querySelector('.event-panel')).not.toBeNull();
    expect(timeline.querySelector('.status-bars')).toBeNull();
    expect(within(timeline).getByText(/Age:/)).toBeInTheDocument();
  });

  it('keeps previous years available in the central timeline history', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/name/i), 'Mina Lin');
    await userEvent.click(screen.getByRole('button', { name: /create life/i }));

    await resolvePendingEvent();

    for (let index = 0; index < 4; index += 1) {
      await userEvent.click(screen.getByRole('button', { name: /age up/i }));
      await resolvePendingEvent();
    }

    const timeline = screen.getByRole('region', { name: /life timeline/i });

    expect(timeline.querySelectorAll('.life-timeline__entry').length).toBeGreaterThan(5);
  });
});

async function resolvePendingEvent() {
  const eventDialog = screen.queryByRole('dialog', { name: /this year/i });

  if (eventDialog === null) {
    return;
  }

  await userEvent.click(within(eventDialog).getAllByRole('button')[0]);
  await userEvent.click(await screen.findByRole('dialog', { name: /result/i }));
}
