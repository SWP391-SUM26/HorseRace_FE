// lucide ships no "Horse"; reuse the project's stand-in alias for the stable.
import { Rabbit as HorseIcon, Wallet, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '@/common/ui';
import { usd } from '../format';
import type { OverviewKpis } from '../types';

export function OverviewKpiGrid({ kpis }: { kpis: OverviewKpis }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-brand-700 bg-brand-800 p-6 text-white shadow-sm">
        <p className="text-sm text-white/70">Lifetime Earnings</p>
        <p className="mt-1 text-3xl font-semibold">{usd(kpis.lifetimeEarnings)}</p>
        <p className="mt-2 text-xs text-white/70">
          Starts {kpis.starts} · Wins {kpis.wins} · Top 3 {kpis.top3}
        </p>
      </div>

      <StatCard
        label="Active Horses"
        value={kpis.activeHorses}
        icon={<HorseIcon size={18} />}
      />

      <StatCard
        label="Net Profit"
        value={
          <span className="inline-flex items-center gap-2">
            {usd(kpis.netProfit)}
            {kpis.netProfitTrend != null && (
              <span className="inline-flex items-center gap-0.5 text-sm font-medium text-success">
                <TrendingUp size={14} />+{kpis.netProfitTrend}%
              </span>
            )}
          </span>
        }
        hint={kpis.margin != null ? `Margin ${kpis.margin}%` : undefined}
        icon={<Wallet size={18} />}
      />

      <StatCard
        label="Pending Payouts"
        value={<span className="text-warning">{usd(kpis.pendingPayouts)}</span>}
        hint={
          kpis.pendingEtaDays != null
            ? `${kpis.pendingCount} pending · ~${kpis.pendingEtaDays} days`
            : `${kpis.pendingCount} pending`
        }
        icon={<Clock size={18} />}
      />
    </div>
  );
}
