import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Check, Download, FileText, ShieldCheck, X } from 'lucide-react';
import { PageHeader } from '@/common/components/PageHeader';
import { DocumentViewerModal, useDocumentViewer } from '@/common/components/DocumentViewerModal';
import { Badge, Button, Card, CardBody, EmptyState, Select, Skeleton, Textarea } from '@/common/ui';
import { useToast } from '@/common/providers/ToastProvider';
import { formatDate } from '@/common/lib/format';
import { humanize } from '../api';
import { useAcceptEntry, useEntryReviews, useRefereeRaces, useRejectEntry } from '../hooks';
import type { Attachment, DocumentReviewStatus, EntryReview } from '../types';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type OnView = (path: string, fileName?: string | null) => void;

const STATUS_TONE: Record<DocumentReviewStatus, Tone> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

function errMsg(e: unknown): string {
  if (isAxiosError(e)) return e.response?.data?.message ?? 'Something went wrong';
  return 'Something went wrong';
}

/** CN2 — referee reviews each runner's owner + horse documents and accepts / rejects them. */
export default function DocumentReviewPage() {
  const racesQuery = useRefereeRaces();
  const races = racesQuery.data ?? [];
  const [raceId, setRaceId] = useState('');
  const viewer = useDocumentViewer();

  useEffect(() => {
    if (!raceId && races.length > 0) setRaceId(races[0].raceId);
  }, [races, raceId]);

  const reviewsQuery = useEntryReviews(raceId || null);
  const rows = reviewsQuery.data ?? [];
  const race = races.find((r) => r.raceId === raceId);

  return (
    <>
      <PageHeader
        title="Document Review"
        subtitle={race ? `${race.name} — review owner & horse documents before the race.` : 'Review the owner and horse documents for the races assigned to you.'}
      />

      {racesQuery.isPending ? (
        <Skeleton className="h-10 w-72 rounded-lg" />
      ) : races.length === 0 ? (
        <EmptyState
          title="No assigned races"
          description="When an admin assigns you to officiate a race, its entries appear here for document review."
        />
      ) : (
        <>
          <div className="mb-4 w-72">
            <Select
              label="Race"
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              options={races.map((r) => ({
                value: r.raceId,
                label: `${r.raceCode ?? r.raceId.slice(0, 6)} · ${r.name}`,
              }))}
            />
          </div>

          {reviewsQuery.isPending ? (
            <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}</div>
          ) : reviewsQuery.isError ? (
            <EmptyState title="Couldn't load entries" description="Please reload the page." />
          ) : rows.length === 0 ? (
            <EmptyState title="No entries" description="This race has no runners to review yet." />
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((r) => (
                <EntryRow key={r.entryId} raceId={raceId} review={r} onView={viewer.view} />
              ))}
            </div>
          )}
        </>
      )}

      <DocumentViewerModal {...viewer.modalProps} />
    </>
  );
}

function EntryRow({ raceId, review, onView }: { raceId: string; review: EntryReview; onView: OnView }) {
  const toast = useToast();
  const accept = useAcceptEntry(raceId);
  const reject = useRejectEntry(raceId);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const done = review.documentStatus === 'ACCEPTED';
  const busy = accept.isPending || reject.isPending;

  function onAccept() {
    accept.mutate(review.entryId, {
      onSuccess: () => toast.success('Documents accepted'),
      onError: (e) => toast.error(errMsg(e)),
    });
  }
  function confirmReject() {
    if (!reason.trim()) return;
    reject.mutate(
      { entryId: review.entryId, reason: reason.trim() },
      {
        onSuccess: () => { toast.success('Documents rejected'); setRejecting(false); setReason(''); },
        onError: (e) => toast.error(errMsg(e)),
      },
    );
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {review.entryNo != null && <Badge tone="neutral">#{review.entryNo}</Badge>}
              <p className="font-semibold text-ink">{review.horseName}</p>
              <Badge tone={STATUS_TONE[review.documentStatus]}>{humanize(review.documentStatus)}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Owner: {review.ownerName ?? '—'}
              {review.reviewedByName ? ` · Reviewed by ${review.reviewedByName}` : ''}
              {review.reviewedAt ? ` on ${formatDate(review.reviewedAt)}` : ''}
            </p>
            {review.documentStatus === 'REJECTED' && review.reviewReason && (
              <p className="mt-0.5 text-xs text-danger">Reason: {review.reviewReason}</p>
            )}
          </div>
          {!done && !rejecting && (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => { setRejecting(true); setReason(''); }}>
                <X size={15} /> Reject
              </Button>
              <Button size="sm" loading={accept.isPending} disabled={reject.isPending} onClick={onAccept}>
                <Check size={15} /> Accept
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DocGroup title="Owner documents" docs={review.ownerDocs} onView={onView} />
          <DocGroup title="Horse documents" docs={review.horseDocs} onView={onView} />
        </div>

        {rejecting && (
          <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <Textarea
              label="Reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are these documents rejected?"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" disabled={reject.isPending} onClick={() => { setRejecting(false); setReason(''); }}>Cancel</Button>
              <Button size="sm" variant="danger" loading={reject.isPending} disabled={!reason.trim()} onClick={confirmReject}>Confirm reject</Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DocGroup({ title, docs, onView }: { title: string; docs: Attachment[]; onView: OnView }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      {docs.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No documents.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {docs.map((d) => {
            const restricted = (d.sensitivityLevel ?? '').toUpperCase() === 'RESTRICTED';
            return (
              <li key={d.attachmentId}>
                <button
                  type="button"
                  onClick={() => onView(`/attachments/${d.attachmentId}/download`, d.fileName)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-brand-700 hover:bg-subtle"
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{d.fileName}</span>
                  {restricted && (
                    <Badge tone="warning">
                      <ShieldCheck size={11} className="mr-1" /> Restricted
                    </Badge>
                  )}
                  <Download size={13} className="ml-auto shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
