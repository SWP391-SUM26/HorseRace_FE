import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/common/components/PageHeader';
import { Badge, Card, CardBody, EmptyState, Select, Skeleton } from '@/common/ui';
import { formatDate } from '@/common/lib/format';
import { useOwnerRaceReport } from '../hooks';
import type { OwnerRaceReportRow } from '../api';

const humanize = (v: string | null) =>
  !v ? '—' : v.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function fmtMs(ms: number | null): string {
  if (ms == null) return '—';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${m}:${p(s)}.${p(cs)}`;
}

/** Why a registered horse didn't make it into the race. */
function notRunReason(r: OwnerRaceReportRow): string {
  // Entered the race but was pulled before the off — the entry state explains it, not the registration.
  if (r.entered && r.entryStatus === 'SCRATCHED') return 'Scratched';
  switch (r.registrationStatus) {
    case 'REJECTED': return r.rejectionReason ? `Rejected — ${r.rejectionReason}` : 'Registration rejected';
    case 'WITHDRAWN': return 'Withdrawn';
    case 'SUBMITTED':
    case 'UNDER_REVIEW': return 'Awaiting approval';
    case 'DRAFT': return 'Draft (not submitted)';
    case 'APPROVED': return 'Approved but not entered';
    default: return humanize(r.registrationStatus);
  }
}

/** Owner per-race report: which of the owner's horses registered, which actually ran, and results. */
export default function OwnerRaceReportPage() {
  const { data, isPending, isError } = useOwnerRaceReport();
  const [raceId, setRaceId] = useState('');

  // Distinct races the owner registered for, newest first.
  const races = useMemo(() => {
    const map = new Map<string, OwnerRaceReportRow>();
    for (const r of data ?? []) if (r.raceId && !map.has(r.raceId)) map.set(r.raceId, r);
    return [...map.values()].sort(
      (a, b) => +new Date(b.scheduledStartAt ?? 0) - +new Date(a.scheduledStartAt ?? 0),
    );
  }, [data]);

  useEffect(() => {
    if (!raceId && races.length > 0) setRaceId(races[0].raceId!);
  }, [races, raceId]);

  const rows = useMemo(() => (data ?? []).filter((r) => r.raceId === raceId), [data, raceId]);
  const ran = rows.filter((r) => r.participated);
  const didNotRun = rows.filter((r) => !r.participated);
  const race = races.find((r) => r.raceId === raceId);

  return (
    <>
      <PageHeader
        title="My Race Report"
        subtitle="Per race: which of your horses registered, which actually ran, and the results."
      />

      {isPending ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : isError ? (
        <EmptyState title="Couldn't load your report" description="Please reload the page." />
      ) : races.length === 0 ? (
        <EmptyState title="No registrations yet" description="Races you register a horse for will appear here." />
      ) : (
        <>
          <div className="mb-4 w-80 max-w-full">
            <Select
              label="Race"
              value={raceId}
              onChange={(e) => setRaceId(e.target.value)}
              options={races.map((r) => ({
                value: r.raceId!,
                label: `${r.raceCode ?? r.raceId!.slice(0, 6)} · ${r.raceName ?? 'Race'}`,
              }))}
            />
          </div>

          {race && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-subtle/60 px-3 py-2 text-sm">
              <span className="font-semibold text-ink">{race.raceName ?? race.raceCode}</span>
              {race.tournamentName && <span className="text-muted">· {race.tournamentName}</span>}
              {race.raceStatus && <Badge tone="neutral">{humanize(race.raceStatus)}</Badge>}
              {race.scheduledStartAt && <span className="ml-auto text-xs text-muted">{formatDate(race.scheduledStartAt)}</span>}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Participated */}
            <Card>
              <CardBody>
                <h2 className="mb-3 inline-flex items-center gap-2 font-semibold text-ink">
                  <CheckCircle2 size={17} className="text-success" /> Ran the race ({ran.length})
                </h2>
                {ran.length === 0 ? (
                  <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">None of your horses ran in this race.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-2 py-2">Horse</th>
                        <th className="px-2 py-2">Entry status</th>
                        <th className="px-2 py-2 text-right">Finish</th>
                        <th className="px-2 py-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ran.map((r) => (
                        <tr key={r.registrationId}>
                          <td className="px-2 py-2 font-medium text-ink">{r.horseName ?? '—'}</td>
                          <td className="px-2 py-2"><Badge tone={r.entryStatus === 'FINISHED' ? 'success' : r.entryStatus === 'SCRATCHED' || r.entryStatus === 'DISQUALIFIED' ? 'danger' : 'neutral'}>{humanize(r.entryStatus)}</Badge></td>
                          <td className="px-2 py-2 text-right tabular-nums text-ink">{r.finishPosition ?? '—'}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-muted">{fmtMs(r.finishTimeMs)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardBody>
            </Card>

            {/* Registered but did not run */}
            <Card>
              <CardBody>
                <h2 className="mb-3 inline-flex items-center gap-2 font-semibold text-ink">
                  <XCircle size={17} className="text-muted" /> Registered — did not run ({didNotRun.length})
                </h2>
                {didNotRun.length === 0 ? (
                  <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">All your registered horses ran.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-2 py-2">Horse</th>
                        <th className="px-2 py-2">Registration</th>
                        <th className="px-2 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {didNotRun.map((r) => (
                        <tr key={r.registrationId}>
                          <td className="px-2 py-2 font-medium text-ink">{r.horseName ?? '—'}</td>
                          <td className="px-2 py-2"><Badge tone={r.registrationStatus === 'REJECTED' || r.registrationStatus === 'WITHDRAWN' ? 'danger' : 'warning'}>{humanize(r.registrationStatus)}</Badge></td>
                          <td className="px-2 py-2 text-muted">{notRunReason(r)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
