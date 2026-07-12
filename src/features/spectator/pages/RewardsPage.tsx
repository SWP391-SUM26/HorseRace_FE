import { useMemo } from 'react';
import { Bell, Coins } from 'lucide-react';
import { Badge, Card, CardBody, DataTable, EmptyState, Skeleton, type Column } from '@/common/ui';
import { PageHeader } from '@/common/components/PageHeader';
import { useToast } from '@/common/providers/ToastProvider';
import { useClaimReward, useEntryNames, useMyPredictions, usePendingRewards, useRewardHistory } from '../hooks';
import { RewardRow } from '../components/RewardRow';
import { errorMessage, PREDICTION_STATUS_META } from '../constants';
import type { PredictionResponse } from '../types';

const TIER_STEP = 10000; // derived tier threshold — display-only, does not gate claiming

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RewardsPage() {
  const toast = useToast();
  const predictionsQuery = useMyPredictions();
  const pendingQuery = usePendingRewards();
  const historyQuery = useRewardHistory();
  const claim = useClaimReward();

  const predictions = predictionsQuery.data ?? [];
  const pending = pendingQuery.data?.rows ?? [];
  const history = historyQuery.data?.rows ?? [];

  // Resolve predictedEntryId → horse name for the Selection column (BE only sends the entry id).
  const entryNames = useEntryNames(useMemo(() => predictions.map((p) => p.raceId), [predictions]));

  // DERIVED balance — no BE balance endpoint. Sum of settled winnings + claimed rewards.
  const balance = useMemo(() => {
    const winnings = predictions
      .filter((p) => p.status === 'WON')
      .reduce((s, p) => s + (p.potentialPayout ?? 0), 0);
    const claimed = history
      .filter((r) => r.status === 'CLAIMED')
      .reduce((s, r) => s + r.amount, 0);
    return winnings + claimed;
  }, [predictions, history]);

  const tierProgress = Math.min(100, Math.round(((balance % TIER_STEP) / TIER_STEP) * 100));

  // DERIVED alerts — WIN/LOSS predictions + pending reward notifications.
  const alerts = useMemo(() => {
    const settled = predictions
      .filter((p) => p.status === 'WON' || p.status === 'LOST')
      .slice(0, 3)
      .map((p) => ({
        id: p.predictionId,
        text:
          p.status === 'WON'
            ? `You won on ${p.raceName ?? p.raceCode ?? 'a race'} (+${(p.potentialPayout ?? 0).toLocaleString('vi-VN')})`
            : `No luck on ${p.raceName ?? p.raceCode ?? 'a race'}`,
        tone: p.status === 'WON' ? ('success' as const) : ('danger' as const),
      }));
    const rewardAlerts = pending.slice(0, 2).map((r) => ({
      id: r.rewardId,
      text: `${r.title ?? 'A reward'} is ready to claim`,
      tone: 'info' as const,
    }));
    return [...settled, ...rewardAlerts];
  }, [predictions, pending]);

  const historyColumns: Column<PredictionResponse>[] = [
    { key: 'date', header: 'Date', render: (p) => fmtDate(p.submittedAt ?? p.createdAt ?? null) },
    {
      key: 'event',
      header: 'Event & Race',
      render: (p) => <span className="font-medium text-ink">{p.raceName ?? p.raceCode ?? p.raceId}</span>,
    },
    {
      key: 'selection',
      header: 'Selection',
      render: (p) =>
        p.predictedEntryId
          ? (entryNames.get(p.predictedEntryId) ?? `Entry ${p.predictedEntryId.slice(0, 6)}`)
          : '—',
    },
    { key: 'type', header: 'Type', render: (p) => p.predictionType },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (p) => <Badge tone={PREDICTION_STATUS_META[p.status].tone}>{PREDICTION_STATUS_META[p.status].label}</Badge>,
    },
    {
      key: 'points',
      header: 'Points',
      render: (p) =>
        p.status === 'WON'
          ? `+${(p.potentialPayout ?? 0).toLocaleString('vi-VN')}`
          : p.status === 'LOST'
            ? `-${p.stakeAmount.toLocaleString('vi-VN')}`
            : '—',
    },
  ];

  function onClaim(rewardId: string) {
    claim.mutate(rewardId, {
      onSuccess: () => toast.success('Reward claimed'),
      onError: (e) => toast.error(errorMessage(e)),
    });
  }

  const shopRewards = [...pending, ...history].slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards & History" subtitle="Your balance, prediction history, and the trophy room." />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Available balance — DERIVED (no BE balance endpoint) */}
        <div className="rounded-2xl bg-brand-900 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-50/70">Available Balance</p>
          {predictionsQuery.isLoading || historyQuery.isLoading ? (
            <Skeleton className="mt-3 h-10 w-40" />
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <Coins className="h-8 w-8 text-brand-50" />
              <span className="text-4xl font-bold tabular-nums">{balance.toLocaleString('vi-VN')}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {balance >= TIER_STEP ? 'Gold' : 'Silver'} Tier
              </span>
            </div>
          )}
          <p className="mt-1 text-xs text-brand-50/60">Derived from settled winnings + claimed rewards</p>
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-brand-50/80">
              <span>Progress to Platinum</span>
              <span>{tierProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${tierProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Recent alerts — DERIVED */}
        <Card>
          <CardBody>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Bell className="h-4 w-4 text-brand-700" /> Recent Alerts
            </h3>
            {predictionsQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : alerts.length ? (
              <ul className="space-y-2">
                {alerts.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                    <Badge tone={a.tone}>•</Badge>
                    <span className="text-sm text-ink">{a.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No recent alerts.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Prediction History */}
      <Card>
        <CardBody>
          <h3 className="mb-4 text-lg font-semibold text-ink">Prediction History</h3>
          <DataTable
            rows={predictions}
            columns={historyColumns}
            rowKey={(p) => p.predictionId}
            loading={predictionsQuery.isLoading}
            emptyLabel="No predictions yet"
          />
        </CardBody>
      </Card>

      {/* Trophy Room & Shop */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-ink">Trophy Room & Shop</h3>
        {pendingQuery.isLoading || historyQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : shopRewards.length ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {shopRewards.map((r) => (
              <RewardRow key={r.rewardId} reward={r} onClaim={onClaim} claiming={claim.isPending} />
            ))}
          </div>
        ) : (
          <EmptyState title="No rewards yet" description="Earn rewards by predicting and reaching milestones." />
        )}
      </div>
    </div>
  );
}
