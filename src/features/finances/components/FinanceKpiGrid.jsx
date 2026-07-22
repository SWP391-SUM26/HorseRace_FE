import { Wallet, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/common/ui";
import { usd } from "../format";

export function FinanceKpiGrid({ kpis }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Earnings"
        value={
          <span className="inline-flex items-center gap-2">
            {usd(kpis.totalEarnings)}
            <span className="inline-flex items-center gap-0.5 text-sm font-medium text-success">
              <TrendingUp size={14} />+{kpis.earningsTrend}%
            </span>
          </span>
        }
        hint={`Season: ${kpis.season}`}
        icon={<Wallet size={18} />}
      />

      <StatCard
        label="Pending Payouts"
        value={<span className="text-warning">{usd(kpis.pendingPayouts)}</span>}
        hint={`${kpis.pendingCount} Pending · ~${kpis.pendingEtaDays} Days`}
        icon={<Clock size={18} />}
      />

      <StatCard
        label="Total Expenses"
        value={
          <span className="inline-flex items-center gap-2">
            {usd(kpis.totalExpenses)}
            <span className="inline-flex items-center gap-0.5 text-sm font-medium text-danger">
              <TrendingUp size={14} />+{kpis.expensesTrend}%
            </span>
          </span>
        }
        hint="Maintenance & Fees"
        icon={<TrendingDown size={18} />}
      />

      <div className="rounded-2xl border border-brand-700 bg-brand-800 p-6 text-white shadow-sm">
        <p className="text-sm text-white/70">NET PROFIT</p>
        <p className="mt-1 text-3xl font-semibold">{usd(kpis.netProfit)}</p>
        <p className="mt-2 text-xs text-white/70">Margin {kpis.margin}%</p>
      </div>
    </div>
  );
}
