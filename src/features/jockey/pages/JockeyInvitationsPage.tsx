import { useState } from 'react';
import { Check, LogOut, X } from 'lucide-react';
import { isAxiosError } from 'axios';
import { PageHeader } from '@/common/components/PageHeader';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  Skeleton,
  Tabs,
} from '@/common/ui';
import { useAuth } from '@/common/hooks/useAuth';
import { useToast } from '@/common/providers/ToastProvider';
import { formatDate } from '@/common/lib/format';
import {
  useAcceptInvitation,
  useInvitationInsights,
  useJockeyInvitations,
  useRejectInvitation,
  useWithdrawInvitation,
} from '../hooks';
import type { Invitation, InvitationStatus } from '../types';

// Tabs → BE status. Only the three statuses the page surfaces.
const TABS: { key: InvitationStatus; label: string }[] = [
  { key: 'INVITED', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'DECLINED', label: 'Declined' },
];

const STATUS_BADGE: Record<InvitationStatus, { tone: 'warning' | 'success' | 'danger' | 'neutral'; label: string }> = {
  INVITED: { tone: 'warning', label: 'PENDING' },
  ACCEPTED: { tone: 'success', label: 'ACCEPTED' },
  DECLINED: { tone: 'danger', label: 'DECLINED' },
  CANCELLED: { tone: 'neutral', label: 'CANCELLED' },
};

const EMPTY_LABEL: Record<InvitationStatus, string> = {
  INVITED: 'Không có lời mời đang chờ',
  ACCEPTED: 'Không có lời mời đã nhận',
  DECLINED: 'Không có lời mời đã từ chối',
  CANCELLED: 'Không có lời mời',
};

/** Prize amounts are USD-shaped; render with a $ prefix. */
function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export default function JockeyInvitationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<InvitationStatus>('INVITED');
  const [details, setDetails] = useState<Invitation | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Invitation | null>(null);

  const jockeyUserId = user?.id ?? '';
  const { data, isPending, isError } = useJockeyInvitations(jockeyUserId, tab);
  const accept = useAcceptInvitation();
  const reject = useRejectInvitation();
  const withdraw = useWithdrawInvitation();

  function handleAccept(id: string) {
    accept.mutate(id, {
      onSuccess: () => toast.success('Đã nhận lời mời'),
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  function handleDecline(id: string) {
    reject.mutate(id, {
      onSuccess: () => toast.success('Đã từ chối'),
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  function handleWithdraw() {
    if (!withdrawTarget) return;
    withdraw.mutate(withdrawTarget.id, {
      onSuccess: () => {
        toast.success('Đã rút khỏi chặng đua');
        setWithdrawTarget(null);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <>
      <PageHeader
        title="Race Invitations"
        subtitle="Manage incoming ride requests from horse owners."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Tabs tabs={TABS} active={tab} onChange={(k) => setTab(k as InvitationStatus)} />

          {isPending ? (
            <InvitationsSkeleton />
          ) : isError ? (
            <EmptyState
              title="Không tải được lời mời"
              description="Vui lòng tải lại trang để thử lại."
            />
          ) : !data || data.length === 0 ? (
            <EmptyState title={EMPTY_LABEL[tab]} />
          ) : (
            <div className="flex flex-col gap-4">
              {data.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onViewDetails={() => setDetails(inv)}
                  onAccept={() => handleAccept(inv.id)}
                  onDecline={() => handleDecline(inv.id)}
                  onWithdraw={() => setWithdrawTarget(inv)}
                  accepting={accept.isPending && accept.variables === inv.id}
                  declining={reject.isPending && reject.variables === inv.id}
                />
              ))}
            </div>
          )}
        </div>

        <InvitationInsights enabled={!!jockeyUserId} />
      </div>

      <InvitationDetailsModal invitation={details} onClose={() => setDetails(null)} />
      <WithdrawConfirmModal
        invitation={withdrawTarget}
        loading={withdraw.isPending}
        onConfirm={handleWithdraw}
        onClose={() => setWithdrawTarget(null)}
      />
    </>
  );
}

interface CardProps {
  invitation: Invitation;
  onViewDetails: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
  accepting: boolean;
  declining: boolean;
}

function InvitationCard({
  invitation,
  onViewDetails,
  onAccept,
  onDecline,
  onWithdraw,
  accepting,
  declining,
}: CardProps) {
  const badge = STATUS_BADGE[invitation.status];
  const isPending = invitation.status === 'INVITED';
  const isAccepted = invitation.status === 'ACCEPTED';

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar name={invitation.horse} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-ink">{invitation.horse}</h3>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </div>
            <p className="text-sm text-muted">{invitation.owner}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Race</p>
            <p className="mt-0.5 text-sm font-medium text-ink">{invitation.race}</p>
            <p className="text-xs text-muted">{formatDate(invitation.date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Prize Pool / Purse Share
            </p>
            <p className="mt-0.5 text-sm font-medium text-ink">
              {formatUsd(invitation.prizePool)}
            </p>
            <p className="text-xs text-muted">
              {invitation.sharePct}% ({formatUsd(invitation.estShare)} est.)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            View Details
          </button>
          {isPending && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                leftIcon={<Check size={16} />}
                loading={accepting}
                disabled={declining}
                onClick={onAccept}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<X size={16} />}
                loading={declining}
                disabled={accepting}
                onClick={onDecline}
              >
                Decline
              </Button>
            </div>
          )}
          {isAccepted && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<LogOut size={16} />}
              className="text-danger hover:bg-danger/10"
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/** Full invitation detail — every field REAL from InvitationResponse. */
function InvitationDetailsModal({
  invitation,
  onClose,
}: {
  invitation: Invitation | null;
  onClose: () => void;
}) {
  const inv = invitation;
  const badge = inv ? STATUS_BADGE[inv.status] : null;
  const distance = inv?.distanceMeter ? `${inv.distanceMeter.toLocaleString('en-US')}m` : '—';

  return (
    <Modal
      open={!!inv}
      onClose={onClose}
      title="Chi tiết lời mời"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      {inv && badge && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={inv.horse} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-ink">{inv.horse}</h4>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </div>
              <p className="text-sm text-muted">
                {inv.horseCode} · Owner: {inv.owner}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Race" value={inv.race} />
            <DetailItem label="Race Code" value={inv.raceCode} />
            <DetailItem label="Tournament" value={inv.tournament} />
            <DetailItem label="Location" value={inv.tournamentLocation} />
            <DetailItem label="Date" value={formatDate(inv.date)} />
            <DetailItem label="Track Condition" value={inv.trackCondition} />
            <DetailItem label="Distance" value={distance} />
            <DetailItem
              label="Entry"
              value={inv.entryNo != null ? `#${inv.entryNo} · ${inv.entryCode}` : inv.entryCode}
            />
          </div>

          <div className="rounded-xl border border-border bg-subtle/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Prize Pool / Purse Share
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">{formatUsd(inv.prizePool)}</p>
            <p className="text-sm text-muted">
              Your share: {inv.sharePct}% ({formatUsd(inv.estShare)} est.)
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

/** Confirm before withdrawing from an ACCEPTED ride (→ CANCELLED, irreversible here). */
function WithdrawConfirmModal({
  invitation,
  loading,
  onConfirm,
  onClose,
}: {
  invitation: Invitation | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!invitation}
      onClose={onClose}
      title="Rút khỏi chặng đua?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Xác nhận rút
          </Button>
        </>
      }
    >
      {invitation && (
        <p className="text-sm text-ink">
          Bạn chắc chắn muốn rút khỏi <span className="font-semibold">{invitation.horse}</span> —{' '}
          <span className="font-semibold">{invitation.race}</span>? Chủ ngựa sẽ cần tìm nài khác và
          không thể hoàn tác thao tác này.
        </p>
      )}
    </Modal>
  );
}

/** REAL — GET /jockeys/me/invitation-insights. */
function InvitationInsights({ enabled }: { enabled: boolean }) {
  const { data, isPending, isError } = useInvitationInsights(enabled);

  return (
    <Card>
      <CardBody className="flex flex-col gap-6">
        <h2 className="font-semibold text-ink">Invitation Insights</h2>

        {isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-20 w-full rounded" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted">Không tải được số liệu.</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Invitations this week
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {data.invitationsThisWeek}{' '}
                <span className="text-sm font-medium text-success">
                  ({data.weekDelta >= 0 ? '+' : ''}
                  {data.weekDelta})
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Acceptance rate
              </p>
              <p className="mt-1 text-sm font-semibold text-ink">{data.acceptanceRate}%</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${data.acceptanceRate}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Most active owners
              </p>
              {data.mostActiveOwners.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Chưa có dữ liệu.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {data.mostActiveOwners.map((owner) => (
                    <li
                      key={owner.ownerUserId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-ink">{owner.name}</span>
                      <span className="text-muted">{owner.requests} requests</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function InvitationsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** Friendly toast text. Withdraw uses HTTP 400 (not 409) for wrong-state. */
function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 409) return 'Lời mời này đã được xử lý.';
    if (status === 400) return 'Chỉ có thể rút những chặng đã nhận.';
    if (status === 403) return 'Bạn không thể thao tác với lời mời này.';
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}
