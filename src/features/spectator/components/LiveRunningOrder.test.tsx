import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveRunningOrder } from './LiveRunningOrder';
import type { RunnerRow } from '../types';

const unranked: RunnerRow[] = [
  { position: null, entryNo: 1, horseName: 'Thunder Bolt', jockeyName: 'A. Mercer', currentSpeedKph: null },
  { position: null, entryNo: 2, horseName: 'Silver Arrow', jockeyName: 'B. Cole', currentSpeedKph: null },
];

const ranked: RunnerRow[] = [
  { position: 1, entryNo: 3, horseName: 'Night Fury', jockeyName: 'C. Diaz', currentSpeedKph: null },
  { position: 2, entryNo: 1, horseName: 'Thunder Bolt', jockeyName: 'A. Mercer', currentSpeedKph: null },
];

describe('LiveRunningOrder', () => {
  it('renders an unranked roster (no rank badges) when every position is null', () => {
    render(<LiveRunningOrder runners={unranked} running />);
    expect(screen.queryAllByTestId('rank-badge')).toHaveLength(0);
    expect(screen.getByText('Thunder Bolt')).toBeInTheDocument();
    expect(screen.getByText('Silver Arrow')).toBeInTheDocument();
  });

  it('renders rank badges once positions exist', () => {
    render(<LiveRunningOrder runners={ranked} running={false} />);
    expect(screen.queryAllByTestId('rank-badge').length).toBeGreaterThan(0);
  });

  it('hides the speed chip when every currentSpeedKph is null', () => {
    render(<LiveRunningOrder runners={unranked} running />);
    expect(screen.queryAllByTestId('runner-speed')).toHaveLength(0);
  });
});
