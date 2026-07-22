import { Download, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, Skeleton, EmptyState } from "@/common/ui";
import { useFinanceOverview } from "../hooks";
import { useWallet } from "@/features/wallet/hooks";
import { BalanceCard } from "@/features/wallet/components/BalanceCard";
import { FinanceKpiGrid } from "../components/FinanceKpiGrid";
import { HorseProfitabilityCard } from "../components/HorseProfitabilityCard";
import { RecentTransactionsCard } from "../components/RecentTransactionsCard";
import { FinanceAlerts } from "../components/FinanceAlerts";

export default function FinancesPage() {
  const { data, isPending, isError } = useFinanceOverview();
  const wallet = useWallet();

  return (
    <>
      <PageHeader
        title="Fiscal Overview"
        subtitle="Real-time tracking of stable performance and overheads."
        actions={
          <>
            {/* Replaces a "Link Bank Account" button that had no handler at
                all. Entry fees come out of this wallet, so the owner needs a
                way to reach it. */}
            <Link to="/wallet">
              <Button variant="secondary" leftIcon={<Wallet size={16} />}>
                Top Up
              </Button>
            </Link>
            <Button leftIcon={<Download size={16} />}>Export Report</Button>
          </>
        }
      />

      {/* Outside the branch below on purpose: a failing /owner/finances must
          not also hide a perfectly good wallet balance — that is the number the
          owner needs before registering. */}
      <div className="mb-6 max-w-sm">
        <BalanceCard
          wallet={wallet.data}
          loading={wallet.isPending}
          error={wallet.isError}
        />
      </div>

      {isPending ? (
        <FinancesSkeleton />
      ) : isError || !data ? (
        <EmptyState
          title="Couldn't load your financials"
          description="Please refresh the page to try again."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <FinanceKpiGrid kpis={data.kpis} />
          <div className="grid gap-6 lg:grid-cols-3">
            <HorseProfitabilityCard horses={data.horses} />
            <div className="lg:col-span-2">
              <RecentTransactionsCard
                transactions={data.transactions}
                total={data.totalTransactions}
              />
            </div>
          </div>
          <FinanceAlerts />
        </div>
      )}
    </>
  );
}

function FinancesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
