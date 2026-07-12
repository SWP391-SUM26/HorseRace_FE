import { useState } from 'react';
import { Card, CardBody, CardHeader, Badge, Button, Skeleton, EmptyState, Textarea } from '@/common/ui';
import { Trophy, Flag, Wind, Gauge, AlertTriangle, FileText, Clock, BadgeCheck } from 'lucide-react';
import { cn } from '@/common/lib/cn';
import { isAxiosError } from 'axios';
import { useToast } from '@/common/providers/ToastProvider';
import { useRaceResultSheet, useRaceReportViolations, useCertifyRaceResults } from '../hooks';
import type { ReportResultRow } from '../types';

function fmtTime(ms: number | null): string {
  if (ms == null) return '—';
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}:${s.toFixed(2).padStart(5, '0')}` : `${s.toFixed(2)}s`;
}

function officialTone(s: string): 'success' | 'warning' | 'neutral' {
  if (s === 'OFFICIAL') return 'success';
  if (s === 'PROVISIONAL') return 'warning';
  return 'neutral';
}
function severityTone(s: string): 'neutral' | 'warning' | 'danger' {
  const u = (s || '').toUpperCase();
  if (u.includes('SEVERE') || u.includes('CRITICAL') || u.includes('MAJOR')) return 'danger';
  if (u.includes('MODERATE') || u.includes('MEDIUM')) return 'warning';
  return 'neutral';
}
const humanize = (v: string) => v.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const PODIUM = ['bg-amber-50 text-warning', 'bg-subtle text-muted', 'bg-orange-50 text-orange-600'];
const PLACE = ['1st', '2nd', '3rd'];

/** Read-only race report: results sheet + stewards' report + logged violations.
 *  When {@link canCertify} is set (admin), an admin can publish provisional results as OFFICIAL. */
export function RaceReportView({ raceId, canCertify = false }: { raceId: string; canCertify?: boolean }) {
  const { data: results, isPending, isError } = useRaceResultSheet(raceId);
  const { data: violations } = useRaceReportViolations(raceId);

  if (isPending) {
    return <div className="flex flex-col gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}</div>;
  }
  if (isError) return <EmptyState title="Couldn't load the report" description="Please try again." />;
  if (!results || results.order.length === 0) {
    return <EmptyState title="Results not published yet" description="The race report appears here once the referee records and certifies the results." />;
  }

  const order = [...results.order].sort((a, b) => (a.finishPosition ?? 99) - (b.finishPosition ?? 99));
  const podium = order.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Status + conditions */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Race Result</h2>
            <Badge tone={officialTone(results.officialityStatus)}>{humanize(results.officialityStatus)}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Clock className="h-4 w-4" />} label="Winning Time" value={fmtTime(results.winningTimeMs)} />
            <Stat icon={<Gauge className="h-4 w-4" />} label="Track" value={results.trackCondition ?? '—'} />
            <Stat icon={<Flag className="h-4 w-4" />} label="Track Bias" value={results.trackBias ?? '—'} />
            <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={results.windSpeedKph != null ? `${results.windSpeedKph} kph` : '—'} />
          </div>
          {canCertify && results.officialityStatus !== 'OFFICIAL' && (
            <CertifyControl raceId={raceId} />
          )}
        </CardBody>
      </Card>

      {/* Podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((r, i) => (
          <div key={r.resultId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold', PODIUM[i])}>
              {i === 0 ? <Trophy className="h-5 w-5" /> : r.finishPosition}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{PLACE[i]}</p>
              <p className="truncate font-semibold text-ink">{r.horseName}</p>
              <p className="truncate text-xs text-muted">{r.jockeyName ?? '—'} · {fmtTime(r.finishTimeMs)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Full finishing order */}
      <Card>
        <CardHeader><h3 className="font-semibold text-ink">Finishing Order</h3></CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2">Pos</th>
                  <th className="px-4 py-2">Horse</th>
                  <th className="px-4 py-2">Jockey</th>
                  <th className="px-4 py-2 text-right">Time</th>
                  <th className="px-4 py-2 text-right">Lengths</th>
                  <th className="px-4 py-2 text-right">Odds</th>
                </tr>
              </thead>
              <tbody>
                {order.map((r) => <ResultRow key={r.resultId} r={r} />)}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Stewards' report */}
      <Card>
        <CardHeader className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted" /><h3 className="font-semibold text-ink">Stewards' Report</h3></CardHeader>
        <CardBody>
          {results.stewardsReport
            ? <p className="whitespace-pre-wrap text-sm text-ink">{results.stewardsReport}</p>
            : <p className="text-sm text-muted">No stewards' report was filed for this race.</p>}
        </CardBody>
      </Card>

      {/* Violations / incidents */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-muted" /><h3 className="font-semibold text-ink">Violations & Incidents</h3></span>
          <span className="text-xs text-muted">{violations?.length ?? 0} logged</span>
        </CardHeader>
        <CardBody>
          {!violations || violations.length === 0 ? (
            <p className="text-sm text-muted">No violations were recorded — a clean race.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {violations.map((v) => (
                <li key={v.violationId} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Badge tone={severityTone(v.severity)}>{humanize(v.severity)}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{humanize(v.infractionType)}</p>
                    <p className="truncate text-xs text-muted">{v.entityLabel}{v.turnNo != null ? ` · Turn ${v.turnNo}` : ''}</p>
                  </div>
                  <Badge tone="neutral">{humanize(v.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ResultRow({ r }: { r: ReportResultRow }) {
  const top = r.finishPosition === 1;
  return (
    <tr className={cn('border-b border-border last:border-0', top && 'bg-brand-50/40')}>
      <td className="px-4 py-2.5">
        <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', top ? 'bg-brand-700 text-white' : 'bg-subtle text-ink')}>
          {r.finishPosition ?? '—'}
        </span>
      </td>
      <td className="px-4 py-2.5 font-medium text-ink">{r.horseName}</td>
      <td className="px-4 py-2.5 text-muted">{r.jockeyName ?? '—'}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{fmtTime(r.finishTimeMs)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-muted">{r.lengthsBehind != null ? `${r.lengthsBehind}` : '—'}</td>
      <td className="px-4 py-2.5 text-right text-muted">{r.odds ?? '—'}</td>
    </tr>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-subtle px-3 py-2">
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{icon}{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

/** Admin-only publish control: certify the referee's provisional results as OFFICIAL. */
function CertifyControl({ raceId }: { raceId: string }) {
  const toast = useToast();
  const certify = useCertifyRaceResults(raceId);
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState('');

  function submit() {
    certify.mutate(report, {
      onSuccess: () => { toast.success('Results certified official'); setOpen(false); },
      onError: (err) => toast.error(
        isAxiosError(err) ? (err.response?.data?.message ?? 'Certification failed') : 'Certification failed',
      ),
    });
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink">
          <strong>Provisional</strong> — publish these results as the official outcome.
        </p>
        {!open && (
          <Button size="sm" leftIcon={<BadgeCheck size={15} />} onClick={() => setOpen(true)}>
            Certify as Official
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            rows={3}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Optional stewards' report appended to the permanent record…"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)} disabled={certify.isPending}>Cancel</Button>
            <Button size="sm" loading={certify.isPending} onClick={submit}>Confirm &amp; Publish</Button>
          </div>
        </div>
      )}
    </div>
  );
}
