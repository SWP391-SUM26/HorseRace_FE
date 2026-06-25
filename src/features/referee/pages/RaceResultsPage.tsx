import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, ScanLine } from 'lucide-react';
import { isAxiosError } from 'axios';
import { PageHeader } from '@/common/components/PageHeader';
import { Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton, Textarea } from '@/common/ui';
import { useToast } from '@/common/providers/ToastProvider';
import { useCertifyResults, useRaceViolations, useRecordRuling, useRefereeRaces, useResults } from '../hooks';
import { humanize } from '../api';
import { DECISION_TYPES } from '../constants';
import type { OfficialityStatus, RaceResults } from '../types';

/** ms → "M:SS.dd" */
function fmtMs(ms: number | null): string {
  if (ms == null) return '—';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${m}:${p(s)}.${p(cs)}`;
}

const OFFICIALITY_TONE: Record<OfficialityStatus, 'success' | 'warning' | 'info' | 'neutral'> = {
  OFFICIAL: 'success',
  PROVISIONAL: 'warning',
  UNDER_REVIEW: 'info',
  AMENDED: 'neutral',
};

export default function RaceResultsPage() {
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState('');

  useEffect(() => {
    if (!raceId && racesQuery.data && racesQuery.data.length > 0) {
      setRaceId(racesQuery.data[0].raceId);
    }
  }, [racesQuery.data, raceId]);

  const resultsQuery = useResults(raceId || null);
  const race = racesQuery.data?.find((r) => r.raceId === raceId);
  const results = resultsQuery.data;
  const isOfficial = results?.officialityStatus === 'OFFICIAL';

  return (
    <>
      <PageHeader
        title="Official Results & Certification"
        subtitle={race ? `${race.name} · ${race.trackCondition ?? '—'}` : 'Verify the order of finish and certify the result.'}
        actions={
          <Badge tone={isOfficial ? 'success' : 'warning'}>
            {results ? (isOfficial ? 'Certified' : 'Pending Certification') : '—'}
          </Badge>
        }
      />

      <div className="mb-4 w-72">
        <Select
          label="Race"
          value={raceId}
          onChange={(e) => setRaceId(e.target.value)}
          options={(racesQuery.data ?? []).map((r) => ({
            value: r.raceId,
            label: `${r.raceCode ?? r.raceId.slice(0, 6)} · ${r.name}`,
          }))}
        />
      </div>

      {resultsQuery.isPending ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : resultsQuery.isError ? (
        <EmptyState title="Could not load results" description="Please reload the page." />
      ) : !results ? (
        <EmptyState title="No results recorded" description="Results appear once the race is run." />
      ) : (
        <CertificationBody raceId={raceId} results={results} />
      )}
    </>
  );
}

function CertificationBody({ raceId, results }: { raceId: string; results: RaceResults }) {
  const isOfficial = results.officialityStatus === 'OFFICIAL';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* LEFT — photofinish + order + report */}
      <div className="space-y-6 lg:col-span-2">
        {/* Photofinish telemetry */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 font-semibold text-ink">
                <ScanLine size={16} className="text-brand-700" /> Photofinish Telemetry
              </h2>
              <Badge tone={OFFICIALITY_TONE[results.officialityStatus]}>{results.officialityStatus}</Badge>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-brand-900">
              <div className="flex h-56 items-center justify-center text-sm text-white/60">
                <ScanLine size={28} className="mr-2 opacity-60" /> Finish-line capture
              </div>
              {results.photofinishUrl && (
                <img
                  src={results.photofinishUrl}
                  alt="Photofinish"
                  className="absolute inset-0 h-56 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
                Camera: Finish Line Prime · 10,000 FPS
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Provisional order of finish */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink">
                {isOfficial ? 'Official Order of Finish' : 'Provisional Order of Finish'}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <BadgeCheck size={14} /> Integrity check passed
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-2 py-2">Rank</th>
                    <th className="px-2 py-2">PGM</th>
                    <th className="px-2 py-2">Horse</th>
                    <th className="px-2 py-2">Jockey</th>
                    <th className="px-2 py-2 text-right">Weight</th>
                    <th className="px-2 py-2 text-right">Time</th>
                    <th className="px-2 py-2 text-right">Margin</th>
                    <th className="px-2 py-2 text-right">Odds</th>
                  </tr>
                </thead>
                <tbody>
                  {results.order.map((o) => (
                    <tr key={o.resultId} className="border-b border-border/60">
                      <td className="px-2 py-2 font-semibold tabular-nums text-ink">{o.finishPosition ?? '—'}</td>
                      <td className="px-2 py-2 tabular-nums text-muted">{o.entryNo ?? '—'}</td>
                      <td className="px-2 py-2 font-medium text-ink">{o.horseName}</td>
                      <td className="px-2 py-2 text-muted">{o.jockeyName ?? '—'}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted">{o.weightCarriedLbs ?? '—'}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-ink">{fmtMs(o.finishTimeMs)}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted">
                        {o.lengthsBehind != null ? (o.lengthsBehind === 0 ? '—' : o.lengthsBehind) : '—'}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted">{o.odds ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Stewards report + final certification */}
        <CertifyCard raceId={raceId} disabled={isOfficial} />
      </div>

      {/* RIGHT — active inquiry + telemetry */}
      <aside className="space-y-6">
        <ActiveInquiry raceId={raceId} />
        <Card>
          <CardBody className="flex flex-col gap-3">
            <h2 className="font-semibold text-ink">Race Telemetry</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Tele label="Winning Time" value={fmtMs(results.winningTimeMs)} />
              <Tele
                label="Fractions"
                value={results.fractions && results.fractions.length > 0 ? results.fractions.join(', ') : '—'}
              />
              <Tele label="Wind" value={results.windSpeedKph != null ? `${results.windSpeedKph} kph` : '—'} />
              <Tele label="Track Bias" value={results.trackBias ?? '—'} />
              <Tele label="Track Condition" value={results.trackCondition ?? '—'} />
            </dl>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function Tele({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

/** Active inquiry = the first pending violation for the race. Resolve → ruling. */
function ActiveInquiry({ raceId }: { raceId: string }) {
  const toast = useToast();
  const violationsQuery = useRaceViolations(raceId || null);
  const pending = useMemo(
    () => (violationsQuery.data ?? []).filter((v) => v.status === 'PENDING' || v.status === 'UNDER_REVIEW'),
    [violationsQuery.data],
  );
  const inquiry = pending[0] ?? null;
  const ruling = useRecordRuling(inquiry?.violationId ?? '');
  const [open, setOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('PENALTY_APPLIED');
  const [notes, setNotes] = useState('');

  if (!inquiry) {
    return (
      <Card>
        <CardBody>
          <h2 className="font-semibold text-ink">Inquiries</h2>
          <p className="mt-2 text-sm text-muted">No active inquiries. Clear to certify.</p>
        </CardBody>
      </Card>
    );
  }

  function resolve() {
    ruling.mutate(
      { decisionType, rulingNotes: notes.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Inquiry resolved');
          setOpen(false);
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 font-semibold text-danger">
          <AlertTriangle size={16} /> Active Inquiry
        </h2>
        <Badge tone="danger">Review Required</Badge>
      </div>
      <p className="mt-2 text-sm text-ink">
        {humanize(inquiry.infractionType)} — {inquiry.entityLabel}
        {inquiry.turnNo != null ? ` (Turn ${inquiry.turnNo})` : ''}.
      </p>
      {!open ? (
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Resolve Inquiry
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <Select
            label="Decision"
            value={decisionType}
            onChange={(e) => setDecisionType(e.target.value)}
            options={DECISION_TYPES}
          />
          <Textarea
            label="Ruling notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ruling…"
          />
          <div className="flex gap-2">
            <Button size="sm" loading={ruling.isPending} onClick={resolve}>
              Confirm
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CertifyCard({ raceId, disabled }: { raceId: string; disabled: boolean }) {
  const toast = useToast();
  const certify = useCertifyResults(raceId);
  const [report, setReport] = useState('');
  const [pin, setPin] = useState('');
  const [ack, setAck] = useState(false);

  function submit() {
    certify.mutate(
      { chiefStewardPin: pin, acknowledgeInquiriesResolved: ack, stewardsReport: report.trim() || undefined },
      {
        onSuccess: () => toast.success('Results certified official'),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardBody className="flex flex-col gap-2">
          <h2 className="font-semibold text-ink">Official Stewards Report</h2>
          <p className="text-xs text-muted">Appended to the permanent race record.</p>
          <Textarea
            rows={6}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Summarize the race, any inquiries, and the official outcome…"
            disabled={disabled}
          />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex flex-col gap-3">
          <h2 className="font-semibold text-ink">Final Certification</h2>
          <p className="text-xs text-muted">
            Certifying makes the results <strong>OFFICIAL</strong> (admin / RESULT_PUBLISH). Requires the chief
            steward PIN and confirmation that all inquiries are resolved.
          </p>
          <Input
            label="Chief Steward Signature (PIN)"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            disabled={disabled}
          />
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500"
            />
            I acknowledge that all pending inquiries are resolved and the photofinish has been verified.
          </label>
          <Button
            leftIcon={<BadgeCheck size={16} />}
            loading={certify.isPending}
            disabled={disabled || !pin.trim() || !ack}
            onClick={submit}
          >
            {disabled ? 'Already certified' : 'Certify Official Results'}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const s = err.response?.status;
    if (s === 403) return 'Only an admin can certify official results.';
    if (s === 400) return 'Certification blocked — resolve open inquiries or check the PIN.';
    if (s === 409) return 'These results are already official.';
  }
  return 'Something went wrong. Please try again.';
}
