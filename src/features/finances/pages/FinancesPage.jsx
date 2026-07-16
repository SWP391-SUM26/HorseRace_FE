import { Download, Landmark } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, Card, CardBody, EmptyState, Skeleton, StatCard } from "@/common/ui";
import { formatMoney } from "@/common/lib/format";
import { useTransactions, useWallet } from "@/features/wallet/hooks";
import { TransactionHistory } from "@/features/wallet/components/TransactionHistory";

export default function FinancesPage() {
  const walletQuery = useWallet();
  const transactionsQuery = useTransactions({ page: 0, size: 10 });

  const wallet = walletQuery.data;
  const transactions = transactionsQuery.data?.rows ?? [];
  const creditTotal = transactions
    .filter((transaction) => transaction.entryType === "CREDIT")
    .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);
  const debitTotal = transactions
    .filter((transaction) => transaction.entryType === "DEBIT")
    .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Fiscal Overview"
        subtitle="Real-time tracking of stable performance and overheads."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Landmark size={16} />} disabled>
              Link Bank Account
            </Button>
            <Button leftIcon={<Download size={16} />} disabled>Export Report</Button>
          </>
        }
      />

      {walletQuery.isPending ? (
        <FinancesSkeleton />
      ) : walletQuery.isError ? (
        <EmptyState title="Couldn't load your financials" description="Please refresh the page to try again." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Available Balance"
              value={formatMoney(wallet?.balance ?? 0)}
              hint="Current wallet balance"
              icon={<Landmark size={18} />}
            />
            <StatCard
              label="Locked Balance"
              value={formatMoney(wallet?.lockedBalance ?? 0)}
              hint="Funds currently on hold"
            />
            <StatCard label="Credits Loaded" value={formatMoney(creditTotal)} hint="From recent transactions" />
            <StatCard label="Debits Loaded" value={formatMoney(debitTotal)} hint="From recent transactions" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardBody>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Horse Profitability</h3>
                <EmptyState
                  title="No profitability API connected"
                  description="Backend currently exposes wallet transactions, not per-horse financial analytics."
                />
              </CardBody>
            </Card>
            <div className="lg:col-span-2">
              <TransactionHistory
                rows={transactions}
                loading={transactionsQuery.isLoading}
                page={transactionsQuery.data?.page ?? 0}
                totalPages={transactionsQuery.data?.totalPages ?? 1}
                onPageChange={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FinancesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
