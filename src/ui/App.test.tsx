import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { SAVE_KEY, useLifeStore } from '../store/lifeStore';

describe('App', () => {
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
});
