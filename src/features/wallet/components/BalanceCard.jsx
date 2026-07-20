import { Wallet, Lock } from 'lucide-react';
import { Card, Skeleton } from '@/common/ui';
import { formatMoney } from '@/common/lib/format';

/** The headline balance tile — spendable VND balance + the held (locked) amount. */
export function BalanceCard({ wallet, loading, error }) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-9 w-40" />
        <Skeleton className="mt-4 h-4 w-32" />
      </Card>
    );
  }

  const balance = wallet?.balance ?? 0;
  const locked = wallet?.lockedBalance ?? 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">Available Balance</p>
          <p className="mt-1 text-3xl font-semibold text-ink" aria-label="Available balance">
            {error ? '—' : formatMoney(balance)}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Wallet size={20} />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted">
        <Lock size={14} />
        <span>On hold: {error ? '—' : formatMoney(locked)}</span>
      </div>
    </Card>
  );
}
