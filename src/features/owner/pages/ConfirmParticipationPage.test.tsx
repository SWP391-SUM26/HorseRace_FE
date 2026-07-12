import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { RaceParticipant } from '@/features/admin/api';
import type { HorseMedicalStatus } from '@/features/admin/types';
import type { OwnerRegistration } from '../api';

const CURRENT_USER_ID = 'owner-1';

// ---- controllable hook state ----
let entriesReturn: { data?: RaceParticipant[]; isPending: boolean; isError: boolean; refetch?: () => void };
let medicalReturn: { data?: HorseMedicalStatus; isPending: boolean; isError: boolean };
let regsReturn: { data?: OwnerRegistration[]; isPending: boolean; isError: boolean };
const regsCalls: { ownerUserId: string | null; raceId: string | null }[] = [];
const toastSuccess = vi.fn();
const entriesRefetch = vi.fn();

vi.mock('../hooks', () => ({
  useConfirmRaceEntries: () => entriesReturn,
  useConfirmHorseMedical: () => medicalReturn,
  useOwnerRaceRegistrations: (ownerUserId: string | null, raceId: string | null) => {
    regsCalls.push({ ownerUserId, raceId });
    return regsReturn;
  },
}));
vi.mock('@/common/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: CURRENT_USER_ID, role: 'HORSE_OWNER', fullName: 'Ann', email: 'a@a.com' } }),
}));
vi.mock('@/common/providers/ToastProvider', () => ({
  useToast: () => ({ success: toastSuccess, error: vi.fn(), info: vi.fn() }),
}));

import ConfirmParticipationPage from './ConfirmParticipationPage';

const baseEntry: RaceParticipant = {
  entryId: 'e1', entryNo: 3, entryCode: 'E-3', laneNo: 3, drawStall: '3', status: 'CONFIRMED',
  horseId: 'h1', horseName: 'Thunder Bolt', ownerUserId: CURRENT_USER_ID, ownerName: 'Ann',
  jockeyUserId: 'j1', jockeyName: 'Lee Jockey', weightCarriedLbs: 120, recentForm: '1-2-1', odds: '3.5',
};
const healthyMedical: HorseMedicalStatus = {
  horseId: 'h1', horseName: 'Thunder Bolt', healthStatus: 'HEALTHY', lastHealthCheckAt: '2026-06-01',
  medicalNote: null, vaccinationsUpToDate: true, recoveryPercent: 100,
};
const approvedReg: OwnerRegistration = { registrationId: 'r1', status: 'APPROVED', horseId: 'h1', horseName: 'Thunder Bolt', raceId: 'race-1' };

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/owner/races/race-1/confirm']}>
      <Routes>
        <Route path="/app/owner/races/:raceId/confirm" element={<ConfirmParticipationPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const ok = <T,>(data: T) => ({ data, isPending: false, isError: false });

describe('ConfirmParticipationPage', () => {
  beforeEach(() => {
    regsCalls.length = 0;
    toastSuccess.mockReset();
    entriesRefetch.mockReset();
    entriesReturn = ok([baseEntry]);
    medicalReturn = ok(healthyMedical);
    regsReturn = ok([approvedReg]);
  });

  it('renders a distinct, retryable error state (not "no entry found") when the entries query errors', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    entriesReturn = { data: undefined, isPending: false, isError: true, refetch: entriesRefetch };
    const u = userEvent.setup();
    renderPage();
    expect(screen.getByText(/couldn't load this race entry/i)).toBeInTheDocument();
    expect(screen.queryByText(/no entry found/i)).toBeNull();
    await u.click(screen.getByRole('button', { name: /retry/i }));
    expect(entriesRefetch).toHaveBeenCalled();
  });

  it('scopes the /registrations query to the current owner id (security)', () => {
    renderPage();
    expect(regsCalls.length).toBeGreaterThan(0);
    expect(regsCalls.every((c) => c.ownerUserId === CURRENT_USER_ID)).toBe(true);
    expect(regsCalls.at(-1)?.raceId).toBe('race-1');
  });

  it('reads Ready when jockey present + docs approved + vet cleared', () => {
    renderPage();
    expect(screen.queryByText(/no jockey assigned/i)).toBeNull();
    expect(screen.getByText(/ready to confirm/i)).toBeInTheDocument();
    // The confirm action is enabled.
    expect(screen.getByRole('button', { name: /confirm participation/i })).toBeEnabled();
  });

  it('reads Blocked when the jockey is missing', () => {
    entriesReturn = ok([{ ...baseEntry, jockeyUserId: null, jockeyName: null }]);
    renderPage();
    expect(screen.getByText(/no jockey assigned/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm participation/i })).toBeDisabled();
  });

  it('fires a success toast when confirming a ready entry', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const u = userEvent.setup();
    renderPage();
    await u.click(screen.getByRole('button', { name: /confirm participation/i }));
    expect(toastSuccess).toHaveBeenCalled();
  });
});
