import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button, Card, CardBody, Input } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useToast } from "@/common/providers/ToastProvider";
import { formatMoney } from "@/common/lib/format";
import { useTopup, useTransactions, useWallet, useWithdraw } from "../hooks";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionHistory } from "../components/TransactionHistory";

/** Smallest VND top-up / withdrawal we accept (mirrors the betting floor). */
const MIN_AMOUNT = 10_000;

export default function WalletPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [topupAmount, setTopupAmount] = useState(50_000);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const walletQuery = useWallet();
  const txQuery = useTransactions({ page });
  const topupMutation = useTopup();
  const withdrawMutation = useWithdraw();

  const topupInvalid = !(topupAmount >= MIN_AMOUNT);
  const balance = walletQuery.data?.balance ?? 0;
  const withdrawInvalid =
    !(withdrawAmount >= MIN_AMOUNT) || withdrawAmount > balance;

  function onTopup() {
    if (topupInvalid) return;
    topupMutation.mutate(topupAmount, {
      onSuccess: (res) => {
        // Hand off to VNPay.
        window.location.assign(res.payUrl);
      },
    });
  }

  function onWithdraw() {
    if (withdrawInvalid) return;
    withdrawMutation.mutate(withdrawAmount, {
      onSuccess: () => {
        toast.success(
          "Withdrawal requested — funds are held pending admin review.",
        );
        setWithdrawAmount(0);
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wallet"
        subtitle="Top up in VND, review your balance, and track every transaction."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <BalanceCard
            wallet={walletQuery.data}
            loading={walletQuery.isLoading}
            error={walletQuery.isError}
          />

          {/* Top-up */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Top Up (VND)
              </h3>
              <Input
                label="Amount (VND)"
                type="number"
                min={MIN_AMOUNT}
                step={10_000}
                value={topupAmount || ""}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                placeholder="Enter amount in VND"
              />
              {topupInvalid && (
                <p className="text-xs text-danger">
                  Minimum top-up is {formatMoney(MIN_AMOUNT)}.
                </p>
              )}
              <Button
                className="w-full"
                leftIcon={<ArrowUpRight size={16} />}
                loading={topupMutation.isPending}
                disabled={topupInvalid}
                onClick={onTopup}
              >
                Top up via VNPay
              </Button>
            </CardBody>
          </Card>

          {/* Withdraw */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Withdraw (VND)
              </h3>
              <Input
                label="Amount (VND)"
                type="number"
                min={MIN_AMOUNT}
                step={10_000}
                value={withdrawAmount || ""}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                placeholder="Enter amount in VND"
              />
              {withdrawAmount > 0 && withdrawInvalid && (
                <p className="text-xs text-danger">
                  {withdrawAmount > balance
                    ? "Amount exceeds your available balance."
                    : `Minimum withdrawal is ${formatMoney(MIN_AMOUNT)}.`}
                </p>
              )}
              <Button
                className="w-full"
                variant="secondary"
                leftIcon={<ArrowDownLeft size={16} />}
                loading={withdrawMutation.isPending}
                disabled={withdrawInvalid}
                onClick={onWithdraw}
              >
                Request withdrawal
              </Button>
            </CardBody>
          </Card>
        </div>

        <TransactionHistory
          rows={txQuery.data?.rows ?? []}
          loading={txQuery.isLoading}
          page={txQuery.data?.page ?? page}
          totalPages={txQuery.data?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
