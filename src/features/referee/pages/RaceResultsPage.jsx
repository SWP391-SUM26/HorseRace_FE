import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Lock, Mail, ShieldQuestion, Trash2 } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useAuth } from "@/common/hooks/useAuth";
import {
  useDeleteResult,
  useFlagInquiry,
  useRaceEntries,
  useRaceViolations,
  useRecordResults,
  useRecordRuling,
  useRefereeRaces,
  useRequestRefereeCode,
  useResults,
  useSubmitReport
} from "../hooks";
import { humanize } from "../api";
import { DECISION_TYPES } from "../constants";
function fmtMs(ms) {
  if (ms == null) return "\u2014";
  const m = Math.floor(ms / 6e4);
  const s = Math.floor(ms % 6e4 / 1e3);
  const cs = Math.floor(ms % 1e3 / 10);
  const p = (n) => String(n).padStart(2, "0");
  return `${m}:${p(s)}.${p(cs)}`;
}
const OFFICIALITY_TONE = {
  OFFICIAL: "success",
  PROVISIONAL: "warning",
  UNDER_REVIEW: "info",
  AMENDED: "neutral"
};
function RaceResultsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");
  const reportableRaces = useMemo(
    () => (racesQuery.data ?? []).filter((r) => r.status === "FINISHED" || r.status === "OFFICIAL"),
    [racesQuery.data]
  );
  useEffect(() => {
    if (!raceId && reportableRaces.length > 0) {
      setRaceId(reportableRaces[0].raceId);
    }
  }, [reportableRaces, raceId]);
  const resultsQuery = useResults(raceId || null);
  const race = reportableRaces.find((r) => r.raceId === raceId);
  const results = resultsQuery.data;
  const isOfficial = results?.officialityStatus === "OFFICIAL";
  return <>
      <PageHeader
    title="Results — Record & Submit"
    subtitle={race ? `${race.name} \xB7 ${race.trackCondition ?? "\u2014"}` : "Record the order of finish, then publish for admin certification."}
    actions={<Badge tone={isOfficial ? "success" : "warning"}>
            {results && results.order.length > 0 ? isOfficial ? "Certified" : "Provisional" : "\u2014"}
          </Badge>}
  />

      <div className="mb-4 w-72">
        <Select
    label="Race"
    value={raceId}
    onChange={(e) => setRaceId(e.target.value)}
    options={reportableRaces.map((r) => ({
      value: r.raceId,
      label: `${r.raceCode ?? r.raceId.slice(0, 6)} \xB7 ${r.name}`
    }))}
  />
      </div>

      {reportableRaces.length === 0 ? <EmptyState
    title="No finished races yet"
    description="Results can be entered once an admin ends one of your assigned races."
  /> : !raceId ? <EmptyState title="Select a race" description="Pick a finished race to record its results." /> : <ResultsBody
    raceId={raceId}
    results={results ?? null}
    loading={resultsQuery.isPending}
    isAdmin={isAdmin}
  />}
    </>;
}
function ResultsBody({
  raceId,
  results,
  loading,
  isAdmin
}) {
  const isOfficial = results?.officialityStatus === "OFFICIAL";
  const submitted = (results?.order ?? []).some((o) => !!o.refereeSubmittedAt);
  const refereeLocked = submitted || isOfficial;
  const editable = isAdmin ? !isOfficial : !refereeLocked;
  const entriesQuery = useRaceEntries(raceId || null);
  const [rows, setRows] = useState({});
  const seeded = useMemo(() => {
    const byEntryNo = new Map((results?.order ?? []).map((o) => [o.entryNo, o]));
    const next = {};
    for (const e of entriesQuery.data ?? []) {
      const o = e.entryNo != null ? byEntryNo.get(e.entryNo) : void 0;
      next[e.entryId] = {
        pos: o?.finishPosition != null ? String(o.finishPosition) : "",
        sec: o?.finishTimeMs != null ? String((o.finishTimeMs / 1e3).toFixed(2)) : ""
      };
    }
    return next;
  }, [entriesQuery.data, results]);
  useEffect(() => setRows(seeded), [seeded]);
  function setCell(entryId, key, value) {
    setRows((r) => ({ ...r, [entryId]: { ...r[entryId] ?? { pos: "", sec: "" }, [key]: value } }));
  }
  function buildPayload() {
    return (entriesQuery.data ?? []).map((e) => {
      const cell = rows[e.entryId];
      if (!cell || !cell.pos.trim()) return null;
      const sec = cell.sec.trim() ? Number(cell.sec) : void 0;
      return {
        entryId: e.entryId,
        finishPosition: Number(cell.pos),
        finishTimeMs: sec != null && !Number.isNaN(sec) ? Math.round(sec * 1e3) : void 0
      };
    }).filter(Boolean);
  }
  return <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {refereeLocked && !isAdmin && <LockBanner isOfficial={isOfficial} />}

        {editable && <Card>
            <CardBody>
              <h2 className="mb-1 font-semibold text-ink">Record / Edit Order of Finish</h2>
              <p className="mb-3 text-xs text-muted">Set each runner's finishing position. Leave blank to skip a horse.</p>
              {entriesQuery.isPending ? <Skeleton className="h-32 w-full rounded-xl" /> : !entriesQuery.data || entriesQuery.data.length === 0 ? <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">No runners entered for this race.</p> : <ResultsGrid entries={entriesQuery.data} rows={rows} setCell={setCell} />}
            </CardBody>
          </Card>}

        {editable && entriesQuery.data && entriesQuery.data.length > 0 && (isAdmin ? <AdminSavePanel raceId={raceId} buildPayload={buildPayload} /> : <PublishPanel raceId={raceId} buildPayload={buildPayload} />)}

        {
    /* Order of finish (recorded) */
  }
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink">
                {isOfficial ? "Official Order of Finish" : "Provisional Order of Finish"}
              </h2>
              {results && results.order.length > 0 && <Badge tone={OFFICIALITY_TONE[results.officialityStatus]}>{results.officialityStatus}</Badge>}
            </div>
            {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : !results || results.order.length === 0 ? <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
                No results recorded yet. Enter finish positions above and save.
              </p> : <FinishTable
    raceId={raceId}
    results={results}
    canDelete={isAdmin && !isOfficial}
    canInquiry={!isOfficial}
  />}
          </CardBody>
        </Card>

        {
    /* Registered but not entered in this race (read-only). */
  }
        {results && results.registeredNotEntered && results.registeredNotEntered.length > 0 && <Card>
            <CardBody>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-semibold text-ink">Registered — Not Entered</h2>
                <Badge tone="neutral">{results.registeredNotEntered.length}</Badge>
              </div>
              <p className="mb-3 text-xs text-muted">
                Horses approved for this tournament that were not entered in this race.
              </p>
              <ul className="divide-y divide-border">
                {results.registeredNotEntered.map((r) => <li key={r.registrationId} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{r.horseName ?? "\u2014"}</p>
                      <p className="truncate text-xs text-muted">{r.ownerName ?? "\u2014"}</p>
                    </div>
                    {r.registrationCode && <span className="shrink-0 text-xs tabular-nums text-muted">{r.registrationCode}</span>}
                  </li>)}
              </ul>
            </CardBody>
          </Card>}
      </div>

      <aside className="space-y-6">
        <ActiveInquiry raceId={raceId} />
        <AdminCertificationNote isOfficial={isOfficial} />
        {results && results.order.length > 0 && <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="font-semibold text-ink">Race Telemetry</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <Tele label="Winning Time" value={fmtMs(results.winningTimeMs)} />
                <Tele label="Track Condition" value={results.trackCondition ?? "\u2014"} />
                <Tele label="Track Bias" value={results.trackBias ?? "\u2014"} />
              </dl>
            </CardBody>
          </Card>}
      </aside>
    </div>;
}
function LockBanner({ isOfficial }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <Lock size={18} className="mt-0.5 shrink-0 text-brand-700" />
      <div>
        <h2 className="font-semibold text-ink">
          {isOfficial ? "Results certified" : "Report submitted"}
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          {isOfficial ? "These results are certified OFFICIAL and can no longer be edited." : "Report submitted \u2014 awaiting admin certification. You can no longer edit the order of finish."}
        </p>
      </div>
    </div>;
}
function ResultsGrid({
  entries,
  rows,
  setCell
}) {
  return <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-2 py-2">PGM</th>
            <th className="px-2 py-2">Horse</th>
            <th className="px-2 py-2 w-28">Position</th>
            <th className="px-2 py-2 w-32">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => <tr key={e.entryId} className="border-b border-border/60">
              <td className="px-2 py-2 tabular-nums text-muted">{e.entryNo ?? "\u2014"}</td>
              <td className="px-2 py-2 font-medium text-ink">{e.horseName}</td>
              <td className="px-2 py-1.5">
                <Input
    type="number"
    min={1}
    value={rows[e.entryId]?.pos ?? ""}
    onChange={(ev) => setCell(e.entryId, "pos", ev.target.value)}
    placeholder="—"
  />
              </td>
              <td className="px-2 py-1.5">
                <Input
    type="number"
    step="0.01"
    value={rows[e.entryId]?.sec ?? ""}
    onChange={(ev) => setCell(e.entryId, "sec", ev.target.value)}
    placeholder="opt."
  />
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
}
function PublishPanel({ raceId, buildPayload }) {
  const toast = useToast();
  const requestCode = useRequestRefereeCode(raceId);
  const submit = useSubmitReport(raceId);
  const [otp, setOtp] = useState("");
  useEffect(() => setOtp(""), [raceId]);
  function onRequest() {
    requestCode.mutate(void 0, {
      onSuccess: () => toast.success("Code sent to your email"),
      onError: (err) => toast.error(errorMessage(err))
    });
  }
  function onPublish() {
    const results = buildPayload();
    if (results.length === 0) return toast.error("Enter at least one finish position");
    if (!otp.trim()) return toast.error("Enter the code sent to your email");
    submit.mutate(
      { otp: otp.trim(), results, violations: [] },
      {
        onSuccess: () => toast.success("Report submitted \u2014 awaiting admin certification"),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-brand-700" />
        <h2 className="font-semibold text-ink">Publish report</h2>
      </div>
      <p className="mt-1 text-xs text-muted">
        Publishing files the order of finish for admin certification. Request a one-time code — we email it to your
        verified address — then enter it below to publish.
      </p>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Input
    label="One-time code"
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
    placeholder="6-digit code"
    inputMode="numeric"
  />
        <Button variant="secondary" loading={requestCode.isPending} onClick={onRequest}>
          Request code
        </Button>
      </div>
      <div className="mt-3 flex justify-end">
        <Button loading={submit.isPending} disabled={!otp.trim()} onClick={onPublish}>
          Publish report
        </Button>
      </div>
    </div>;
}
function AdminSavePanel({ raceId, buildPayload }) {
  const toast = useToast();
  const record = useRecordResults(raceId);
  function save() {
    const results = buildPayload();
    if (results.length === 0) return toast.error("Enter at least one finish position");
    record.mutate(
      { results },
      {
        onSuccess: () => toast.success("Results saved (provisional)"),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-subtle/40 p-4">
      <p className="text-xs text-muted">Admin override — save results without an OTP.</p>
      <Button loading={record.isPending} onClick={save}>
        Save results
      </Button>
    </div>;
}
function FinishTable({
  raceId,
  results,
  canDelete,
  canInquiry
}) {
  const toast = useToast();
  const del = useDeleteResult(raceId);
  const inquiry = useFlagInquiry(raceId);
  const [confirmId, setConfirmId] = useState(null);
  const showActions = canDelete || canInquiry;
  function remove(resultId) {
    del.mutate(resultId, {
      onSuccess: () => {
        toast.success("Result removed");
        setConfirmId(null);
      },
      onError: (err) => toast.error(errorMessage(err))
    });
  }
  function raise(resultId) {
    inquiry.mutate(resultId, {
      onSuccess: () => toast.success("Result flagged for review"),
      onError: (err) => toast.error(errorMessage(err))
    });
  }
  return <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-2 py-2">Rank</th>
            <th className="px-2 py-2">PGM</th>
            <th className="px-2 py-2">Horse</th>
            <th className="px-2 py-2">Jockey</th>
            <th className="px-2 py-2 text-right">Time</th>
            {showActions && <th className="px-2 py-2 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {results.order.map((o) => <tr key={o.resultId} className="border-b border-border/60">
              <td className="px-2 py-2 font-semibold tabular-nums text-ink">{o.finishPosition ?? "\u2014"}</td>
              <td className="px-2 py-2 tabular-nums text-muted">{o.entryNo ?? "\u2014"}</td>
              <td className="px-2 py-2 font-medium text-ink">
                <span className="inline-flex items-center gap-2">
                  {o.horseName}
                  {o.officialityStatus === "UNDER_REVIEW" && <Badge tone="info">Under Review</Badge>}
                </span>
              </td>
              <td className="px-2 py-2 text-muted">{o.jockeyName ?? "\u2014"}</td>
              <td className="px-2 py-2 text-right tabular-nums text-ink">{fmtMs(o.finishTimeMs)}</td>
              {showActions && <td className="px-2 py-2 text-right">
                  {confirmId === o.resultId ? <span className="inline-flex items-center gap-1">
                      <Button variant="danger" size="sm" loading={del.isPending} onClick={() => remove(o.resultId)}>
                        Delete
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                        Keep
                      </Button>
                    </span> : <span className="inline-flex items-center justify-end gap-3">
                      {canInquiry && o.officialityStatus !== "UNDER_REVIEW" && <button
    type="button"
    onClick={() => raise(o.resultId)}
    disabled={inquiry.isPending}
    className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline disabled:opacity-50"
  >
                          <ShieldQuestion size={13} /> Raise inquiry
                        </button>}
                      {canDelete && <button
    type="button"
    onClick={() => setConfirmId(o.resultId)}
    className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
  >
                          <Trash2 size={13} /> Remove
                        </button>}
                    </span>}
                </td>}
            </tr>)}
        </tbody>
      </table>
    </div>;
}
function AdminCertificationNote({ isOfficial }) {
  return <Card>
      <CardBody className="flex flex-col gap-2">
        <h2 className="inline-flex items-center gap-2 font-semibold text-ink">
          <BadgeCheck size={16} className={isOfficial ? "text-success" : "text-muted"} /> Certification
        </h2>
        {isOfficial ? <p className="text-sm text-success">These results are certified OFFICIAL.</p> : <p className="text-sm text-muted">
            Your results are provisional. An <strong>admin</strong> reviews and certifies them as official —
            owners are notified once published.
          </p>}
      </CardBody>
    </Card>;
}
function Tele({ label, value }) {
  return <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>;
}
function ActiveInquiry({ raceId }) {
  const toast = useToast();
  const violationsQuery = useRaceViolations(raceId || null);
  const pending = useMemo(
    () => (violationsQuery.data ?? []).filter((v) => v.status === "PENDING" || v.status === "UNDER_REVIEW"),
    [violationsQuery.data]
  );
  const inquiry = pending[0] ?? null;
  const ruling = useRecordRuling(inquiry?.violationId ?? "");
  const [open, setOpen] = useState(false);
  const [decisionType, setDecisionType] = useState("PENALTY_APPLIED");
  const [notes, setNotes] = useState("");
  if (!inquiry) {
    return <Card>
        <CardBody>
          <h2 className="font-semibold text-ink">Inquiries</h2>
          <p className="mt-2 text-sm text-muted">No active inquiries.</p>
        </CardBody>
      </Card>;
  }
  function resolve() {
    ruling.mutate(
      { decisionType, rulingNotes: notes.trim() || void 0 },
      {
        onSuccess: () => {
          toast.success("Inquiry resolved");
          setOpen(false);
        },
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 font-semibold text-danger">
          <AlertTriangle size={16} /> Active Inquiry
        </h2>
        <Badge tone="danger">Review Required</Badge>
      </div>
      <p className="mt-2 text-sm text-ink">
        {humanize(inquiry.infractionType)} — {inquiry.entityLabel}
        {inquiry.turnNo != null ? ` (Turn ${inquiry.turnNo})` : ""}.
      </p>
      {!open ? <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Resolve Inquiry
          </Button>
        </div> : <div className="mt-3 flex flex-col gap-3">
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
        </div>}
    </div>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.message) return data.message;
    const s = err.response?.status;
    if (s === 429) return "Too many code requests \u2014 please wait a moment before retrying.";
    if (s === 403) return "You are not authorised to file this report.";
    if (s === 400) return "Check your entries and the one-time code.";
  }
  return "Something went wrong. Please try again.";
}
export {
  RaceResultsPage as default
};
