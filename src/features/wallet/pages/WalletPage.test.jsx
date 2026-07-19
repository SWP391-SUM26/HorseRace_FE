import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

let walletReturn;
let txReturn;
const topupMutate = vi.fn();
const withdrawMutate = vi.fn();

vi.mock('../hooks', () => ({
  useWallet: () => walletReturn,
  useTransactions: () => txReturn,
  useTopup: () => ({ mutate: topupMutate, isPending: false }),
  useWithdraw: () => ({ mutate: withdrawMutate, isPending: false }),
}));
vi.mock('@/common/providers/ToastProvider', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

import WalletPage from './WalletPage';

const assignMock = vi.fn();

const wallet = {
  walletId: 'w1', balance: 250_000, lockedBalance: 40_000, currencyCode: 'VND', status: 'ACTIVE',
};

function ok(data) {
  return { data, isLoading: false, isError: false };
}

describe('WalletPage', () => {
  beforeEach(() => {
    topupMutate.mockReset();
    withdrawMutate.mockReset();
    assignMock.mockReset();
    // jsdom's window.location.assign is non-configurable, so replace the whole location object.
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { assign: assignMock, href: 'http://localhost/app/wallet', search: '', pathname: '/app/wallet', origin: 'http://localhost' },
    });
    walletReturn = ok(wallet);
    txReturn = ok({ rows: [], page: 0, totalPages: 1, total: 0 });
  });

  it('renders the VND balance and on-hold amount from getWallet', () => {
    render(<WalletPage />);
    expect(screen.getByLabelText(/available balance/i)).toHaveTextContent('250.000 ₫');
    expect(screen.getByText(/on hold: 40\.000/i)).toBeInTheDocument();
  });

  it('top-up calls topup and redirects the browser to the returned VNPay payUrl', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const u = userEvent.setup();
    topupMutate.mockImplementation((amount, opts) => {
      opts.onSuccess?.({ payUrl: 'https://vnpay.example/pay?token=abc', amount });
    });
    render(<WalletPage />);
    await u.click(screen.getByRole('button', { name: /top up via vnpay/i }));
    expect(topupMutate).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith('https://vnpay.example/pay?token=abc');
  });
});
