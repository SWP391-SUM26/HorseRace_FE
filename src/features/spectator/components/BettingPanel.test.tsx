import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BettingPanel } from './BettingPanel';

const baseProps = {
  raceStatus: 'OPEN' as const,
  selectionLabel: 'Thunder Bolt',
  oddsLabel: '3.5',
  oddsMultiplier: 3.5,
  stake: 100,
  onStakeChange: vi.fn(),
  onConfirm: vi.fn(),
  submitting: false,
};

describe('BettingPanel — pool gating', () => {
  it('renders an enabled CONFIRM PREDICTION button when the pool is OPEN and a runner is selected', () => {
    render(<BettingPanel {...baseProps} />);
    const btn = screen.getByRole('button', { name: /confirm prediction/i });
    expect(btn).toBeEnabled();
  });

  it('renders a "Betting closed" block and NO confirm button when the race has started', () => {
    render(<BettingPanel {...baseProps} raceStatus="RUNNING" />);
    expect(screen.getByText(/betting closed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm prediction/i })).toBeNull();
  });
});
