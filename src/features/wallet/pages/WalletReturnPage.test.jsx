import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let returnQuery;

vi.mock('../hooks', () => ({
  useVnPayReturn: () => returnQuery,
}));

import WalletReturnPage from './WalletReturnPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/wallet/return?vnp_ResponseCode=00']}>
      <WalletReturnPage />
    </MemoryRouter>,
  );
}

describe('WalletReturnPage', () => {
  beforeEach(() => {
    returnQuery = { data: undefined, isLoading: false, isError: false };
  });

  it('shows a success state when the verified return status is success', () => {
    returnQuery = { data: { success: true, rspCode: '00', message: 'Your top-up was successful.' }, isLoading: false, isError: false };
    renderPage();
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    expect(screen.queryByText(/payment failed/i)).toBeNull();
  });

  it('shows a failure state on a failed/tampered status', () => {
    returnQuery = { data: { success: false, rspCode: '97', message: 'Checksum failed' }, isLoading: false, isError: false };
    renderPage();
    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    expect(screen.queryByText(/payment successful/i)).toBeNull();
  });

  it('shows a failure state when the verification request itself errors', () => {
    returnQuery = { data: undefined, isLoading: false, isError: true };
    renderPage();
    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
  });
});
