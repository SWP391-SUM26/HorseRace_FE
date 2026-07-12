import { useState } from 'react';
import { Check, Flag, X } from 'lucide-react';
import { PageHeader } from '@/common/components/PageHeader';
import { Badge, Button, Card, CardBody, EmptyState, Skeleton, Textarea } from '@/common/ui';
import { useToast } from '@/common/providers/ToastProvider';
import { formatDate } from '@/common/lib/format';
import { humanize } from '../api';
import { useAcceptRaceAssignment, useDeclineRaceAssignment, useMyRaceAssignments } from '../hooks';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const STATUS_TONE: Record<string, Tone> = {
  ASSIGNED: 'warning',
  CONFIRMED: 'success',
  DECLINED: 'danger',
};

/** Referee inbox for PER-RACE officiating assignments (CN1): accept or decline each. */
export default function MyRaceAssignmentsPage() {
  const toast = useToast();
  const query = useMyRaceAssignments();
  const accept = useAcceptRaceAssignment();
  const decline = useDeclineRaceAssignment();
  const rows = query.data ?? [];

  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  function onAccept(id: string) {
    accept.mutate(id, {
      onSuccess: () => toast.success('Assignment accepted'),
      onError: () => toast.error('Could not accept the assignment'),
    });
  }
  function confirmDecline(id: string) {
    decline.mutate(
      { id, reason: reason.trim() || undefined },
      {
        onSuccess: () => { toast.success('Assignment declined'); setDecliningId(null); setReason(''); },
        onError: () => toast.error('Could not decline the assignment'),
      },
    );
  }

  return (
    <>
      <PageHeader
        title="My Race Assignments"
        subtitle="Races an admin assigned you to officiate. Accept to confirm, or decline with a reason."
      />

      {query.isPending ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
      ) : query.isError ? (
        <EmptyState title="Couldn't load assignments" description="Please reload the page." />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No race assignments"
          description="When an admin assigns you to officiate a race, it appears here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((a) => {
            const busy = accept.isPending || decline.isPending;
            const pending = a.status === 'ASSIGNED';
            const isDeclining = decliningId === a.refAssignmentId;
            return (
              <Card key={a.refAssignmentId}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Flag size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{a.raceName ?? a.raceCode ?? 'Race'}</p>
                        {a.panelRole && <Badge tone="neutral">{humanize(a.panelRole)}</Badge>}
                        {a.status && <Badge tone={STATUS_TONE[a.status] ?? 'neutral'}>{humanize(a.status)}</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {a.scheduledStartAt ? `Starts ${formatDate(a.scheduledStartAt)}` : 'Start time TBD'}
                        {a.status === 'DECLINED' && a.declineReason ? ` · Reason: ${a.declineReason}` : ''}
                      </p>
                    </div>
                    {pending && !isDeclining && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" disabled={busy} onClick={() => { setDecliningId(a.refAssignmentId); setReason(''); }}>
                          <X size={15} /> Decline
                        </Button>
                        <Button size="sm" loading={accept.isPending} disabled={decline.isPending} onClick={() => onAccept(a.refAssignmentId)}>
                          <Check size={15} /> Accept
                        </Button>
                      </div>
                    )}
                  </div>

                  {isDeclining && (
                    <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
                      <Textarea
                        label="Reason (optional)"
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Scheduling clash"
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" disabled={decline.isPending} onClick={() => { setDecliningId(null); setReason(''); }}>Cancel</Button>
                        <Button size="sm" loading={decline.isPending} onClick={() => confirmDecline(a.refAssignmentId)}>Confirm decline</Button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
