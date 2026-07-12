import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AppNotification } from '../api';

// Mutable list so a mocked "mark all read" mutation can flip the read flags and prove the styling clears.
let listReturn: { data?: AppNotification[]; isPending: boolean; isError: boolean; refetch: () => void };
const markReadMutate = vi.fn();
const markAllMutate = vi.fn();
const listRefetch = vi.fn();

vi.mock('../hooks', () => ({
  useNotifications: () => listReturn,
  useMarkNotificationRead: () => ({ mutate: markReadMutate }),
  useMarkAllNotificationsRead: () => ({ mutate: markAllMutate, isPending: false }),
}));

import NotificationsPage from './NotificationsPage';

const notifications: AppNotification[] = [
  { notificationId: 'n1', title: 'Race approved', message: 'Your entry was approved', isRead: false, createdAt: '2026-07-01T10:00:00Z' },
  { notificationId: 'n2', title: 'Payout sent', message: 'You received a payout', isRead: true, createdAt: '2026-07-02T10:00:00Z' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <NotificationsPage />
    </MemoryRouter>,
  );
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    markReadMutate.mockReset();
    markAllMutate.mockReset();
    listRefetch.mockReset();
    listReturn = { data: notifications, isPending: false, isError: false, refetch: listRefetch };
  });

  it('shows skeletons while loading', () => {
    listReturn = { data: undefined, isPending: true, isError: false, refetch: listRefetch };
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows an empty state when there are no notifications', () => {
    listReturn = { data: [], isPending: false, isError: false, refetch: listRefetch };
    renderPage();
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('shows a distinct error state (not the empty state) when the fetch fails', async () => {
    listReturn = { data: undefined, isPending: false, isError: true, refetch: listRefetch };
    const u = userEvent.setup();
    renderPage();
    expect(screen.getByText(/couldn't load notifications/i)).toBeInTheDocument();
    expect(screen.queryByText(/no notifications/i)).toBeNull();
    await u.click(screen.getByRole('button', { name: /retry/i }));
    expect(listRefetch).toHaveBeenCalled();
  });

  it('renders a row per notification with an unread marker on unread rows', () => {
    renderPage();
    expect(screen.getByText('Race approved')).toBeInTheDocument();
    expect(screen.getByText('Payout sent')).toBeInTheDocument();
    // Exactly one unread row (n1).
    expect(screen.getAllByLabelText(/unread/i)).toHaveLength(1);
  });

  it('marks a single unread row read when clicked, and does not re-mark a read row', async () => {
    const u = userEvent.setup();
    renderPage();
    await u.click(screen.getByText('Race approved'));
    expect(markReadMutate).toHaveBeenCalledWith('n1');
    markReadMutate.mockReset();
    await u.click(screen.getByText('Payout sent'));
    expect(markReadMutate).not.toHaveBeenCalled();
  });

  it('calls the mark-all mutation and clears unread styling', async () => {
    // Wire the mocked mutation to flip every row read, then re-render to prove the marker disappears.
    markAllMutate.mockImplementation(() => {
      listReturn = { data: notifications.map((n) => ({ ...n, isRead: true })), isPending: false, isError: false, refetch: listRefetch };
    });
    const u = userEvent.setup();
    const { rerender } = renderPage();
    expect(screen.getAllByLabelText(/unread/i)).toHaveLength(1);
    await u.click(screen.getByRole('button', { name: /mark all read/i }));
    expect(markAllMutate).toHaveBeenCalled();
    rerender(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    expect(screen.queryByLabelText(/unread/i)).toBeNull();
  });
});
