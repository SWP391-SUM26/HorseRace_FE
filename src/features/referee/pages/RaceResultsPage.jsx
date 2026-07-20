import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Lock,
  Mail,
  ShieldQuestion,
  Trash2,
  Video,
} from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
  Textarea,
} from "@/common/ui";
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
  useSubmitReport,
  useViolation,
} from "../hooks";
import { humanize } from "../api";
import { DECISION_TYPES, SEVERITY_TONE } from "../constants";

/** ms → "M:SS.dd" */
function fmtMs(ms) {
  if (ms == null) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const p = (n) => String(n).padStart(2, "0");
  return `${m}:${p(s)}.${p(cs)}`;
}

const OFFICIALITY_TONE = {
  OFFICIAL: "success",
  PROVISIONAL: "warning",
  UNDER_REVIEW: "info",
  AMENDED: "neutral",
};

export default function RaceResultsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const racesQuery = useRefereeRaces();
  const [raceId, setRaceId] = useState("");

  // Referees can only file/view reports after the admin ends the race (FINISHED), or once it's OFFICIAL (read-only).
  const reportableRaces = useMemo(
    () =>
      (racesQuery.data ?? []).filter(
        (r) => r.status === "FINISHED" || r.status === "OFFICIAL",
      ),
    [racesQuery.data],
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

  return (
    <>
      <PageHeader
        title="Results — Record & Submit"
        subtitle={
          race
            ? `${race.name} · ${race.trackCondition ?? "—"}`
            : "Record the order of finish, then publish for admin certification."
        }
        actions={
          <Badge tone={isOfficial ? "success" : "warning"}>
            {results && results.order.length > 0
              ? isOfficial
                ? "Certified"
                : "Provisional"
              : "—"}
          </Badge>
        }
      />

      <div className="mb-4 w-72">
        <Select
          label="Race"
          value={raceId}
          onChange={(e) => setRaceId(e.target.value)}
          options={reportableRaces.map((r) => ({
            value: r.raceId,
            label: `${r.raceCode ?? r.raceId.slice(0, 6)} · ${r.name}`,
          }))}
        />
      </div>

      {reportableRaces.length === 0 ? (
        <EmptyState
          title="No finished races yet"
          description="Results can be entered once an admin ends one of your assigned races."
        />
      ) : !raceId ? (
        <EmptyState
          title="Select a race"
          description="Pick a finished race to record its results."
        />
      ) : (
        <ResultsBody
          raceId={raceId}
          results={results ?? null}
          loading={resultsQuery.isPending}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}

function ResultsBody({ raceId, results, loading, isAdmin }) {
  const isOfficial = results?.officialityStatus === "OFFICIAL";
  // Once any row carries a referee submission timestamp the report is filed → referees are locked out.
  const submitted = (results?.order ?? []).some((o) => !!o.refereeSubmittedAt);
  // Referees lose edit rights once the report is submitted or certified. Admins keep the legacy path.
  const refereeLocked = submitted || isOfficial;
  const editable = isAdmin ? !isOfficial : !refereeLocked;

  const entriesQuery = useRaceEntries(raceId || null);
  const [rows, setRows] = useState({});

  // Seed inputs from existing results (matched by entry number).
  const seeded = useMemo(() => {
    const byEntryNo = new Map(
      (results?.order ?? []).map((o) => [o.entryNo, o]),
    );
    const next = {};
    for (const e of entriesQuery.data ?? []) {
      const o = e.entryNo != null ? byEntryNo.get(e.entryNo) : undefined;
      next[e.entryId] = {
        pos: o?.finishPosition != null ? String(o.finishPosition) : "",
        sec:
          o?.finishTimeMs != null
            ? String((o.finishTimeMs / 1000).toFixed(2))
            : "",
      };
    }
    return next;
  }, [entriesQuery.data, results]);

  useEffect(() => setRows(seeded), [seeded]);

  function setCell(entryId, key, value) {
    setRows((r) => ({
      ...r,
      [entryId]: { ...(r[entryId] ?? { pos: "", sec: "" }), [key]: value },
    }));
  }

  /** Build the payload rows from the current inputs (skips runners with no position). */
  function buildPayload() {
    return (entriesQuery.data ?? [])
      .map((e) => {
        const cell = rows[e.entryId];
        if (!cell || !cell.pos.trim()) return null;
        const sec = cell.sec.trim() ? Number(cell.sec) : undefined;
        return {
          entryId: e.entryId,
          finishPosition: Number(cell.pos),
          finishTimeMs:
            sec != null && !Number.isNaN(sec)
              ? Math.round(sec * 1000)
              : undefined,
        };
      })
      .filter(Boolean);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {refereeLocked && !isAdmin && <LockBanner isOfficial={isOfficial} />}

        {editable && (
          <Card>
            <CardBody>
              <h2 className="mb-1 font-semibold text-ink">
                Record / Edit Order of Finish
              </h2>
              <p className="mb-3 text-xs text-muted">
                Set each runner's finishing position. Leave blank to skip a
                horse.
              </p>
              {entriesQuery.isPending ? (
                <Skeleton className="h-32 w-full rounded-xl" />
              ) : !entriesQuery.data || entriesQuery.data.length === 0 ? (
                <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
                  No runners entered for this race.
                </p>
              ) : (
                <ResultsGrid
                  entries={entriesQuery.data}
                  rows={rows}
                  setCell={setCell}
                />
              )}
            </CardBody>
          </Card>
        )}

        {editable &&
          entriesQuery.data &&
          entriesQuery.data.length > 0 &&
          (isAdmin ? (
            <AdminSavePanel raceId={raceId} buildPayload={buildPayload} />
          ) : (
            <PublishPanel raceId={raceId} buildPayload={buildPayload} />
          ))}

        {/* Order of finish (recorded) */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink">
                {isOfficial
                  ? "Official Order of Finish"
                  : "Provisional Order of Finish"}
              </h2>
              {results && results.order.length > 0 && (
                <Badge tone={OFFICIALITY_TONE[results.officialityStatus]}>
                  {results.officialityStatus}
                </Badge>
              )}
            </div>
            {loading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : !results || results.order.length === 0 ? (
              <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
                No results recorded yet. Enter finish positions above and save.
              </p>
            ) : (
              <FinishTable
                raceId={raceId}
                results={results}
                canDelete={isAdmin && !isOfficial}
                canInquiry={!isOfficial}
              />
            )}
          </CardBody>
        </Card>

        {/* Violations logged for this race — appears the moment one is filed and reflects the ruling once resolved. */}
        <RaceViolationsLog raceId={raceId} />

        {/* Registered but not entered in this race (read-only). */}
        {results &&
          results.registeredNotEntered &&
          results.registeredNotEntered.length > 0 && (
            <Card>
              <CardBody>
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="font-semibold text-ink">
                    Registered — Not Entered
                  </h2>
                  <Badge tone="neutral">
                    {results.registeredNotEntered.length}
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-muted">
                  Horses approved for this tournament that were not entered in
                  this race.
                </p>
                <ul className="divide-y divide-border">
                  {results.registeredNotEntered.map((r) => (
                    <li
                      key={r.registrationId}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {r.horseName ?? "—"}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {r.ownerName ?? "—"}
                        </p>
                      </div>
                      {r.registrationCode && (
                        <span className="shrink-0 text-xs tabular-nums text-muted">
                          {r.registrationCode}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
      </div>

      <aside className="space-y-6">
        <AdminCertificationNote isOfficial={isOfficial} />
        {results && results.order.length > 0 && (
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="font-semibold text-ink">Race Telemetry</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <Tele
                  label="Winning Time"
                  value={fmtMs(results.winningTimeMs)}
                />
                <Tele
                  label="Track Condition"
                  value={results.trackCondition ?? "—"}
                />
                <Tele label="Track Bias" value={results.trackBias ?? "—"} />
              </dl>
            </CardBody>
          </Card>
        )}
      </aside>
    </div>
  );
}

/** Banner shown to a referee once the report is filed (or certified) — form is now read-only. */
function LockBanner({ isOfficial }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <Lock size={18} className="mt-0.5 shrink-0 text-brand-700" />
      <div>
        <h2 className="font-semibold text-ink">
          {isOfficial ? "Results certified" : "Report submitted"}
        </h2>
        <p className="mt-0.5 text-sm text-muted">
          {isOfficial
            ? "These results are certified OFFICIAL and can no longer be edited."
            : "Report submitted — awaiting admin certification. You can no longer edit the order of finish."}
        </p>
      </div>
    </div>
  );
}

/** The editable input grid (positions + optional time). */
function ResultsGrid({ entries, rows, setCell }) {
  return (
    <div className="overflow-x-auto">
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
          {entries.map((e) => (
            <tr key={e.entryId} className="border-b border-border/60">
              <td className="px-2 py-2 tabular-nums text-muted">
                {e.entryNo ?? "—"}
              </td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Referee publish flow (CN3): request an emailed OTP, then publish the combined report.
 * Violations continue to be filed on the Violations page, so an empty violations list is sent here.
 */
function PublishPanel({ raceId, buildPayload }) {
  const toast = useToast();
  const requestCode = useRequestRefereeCode(raceId);
  const submit = useSubmitReport(raceId);
  const [otp, setOtp] = useState("");

  useEffect(() => setOtp(""), [raceId]);

  function onRequest() {
    requestCode.mutate(undefined, {
      onSuccess: () => toast.success("Code sent to your email"),
    });
  }

  function onPublish() {
    const results = buildPayload();
    if (results.length === 0)
      return toast.error("Enter at least one finish position");
    if (!otp.trim()) return toast.error("Enter the code sent to your email");
    submit.mutate(
      { otp: otp.trim(), results, violations: [] },
      {
        onSuccess: () =>
          toast.success("Report submitted — awaiting admin certification"),
      },
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-brand-700" />
        <h2 className="font-semibold text-ink">Publish report</h2>
      </div>
      <p className="mt-1 text-xs text-muted">
        Publishing files the order of finish for admin certification. Request a
        one-time code — we email it to your verified address — then enter it
        below to publish.
      </p>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          label="One-time code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit code"
          inputMode="numeric"
        />

        <Button
          variant="secondary"
          loading={requestCode.isPending}
          onClick={onRequest}
        >
          Request code
        </Button>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          loading={submit.isPending}
          disabled={!otp.trim()}
          onClick={onPublish}
        >
          Publish report
        </Button>
      </div>
    </div>
  );
}

/** ADMIN-only legacy save (no OTP) — records provisional results directly. */
function AdminSavePanel({ raceId, buildPayload }) {
  const toast = useToast();
  const record = useRecordResults(raceId);

  function save() {
    const results = buildPayload();
    if (results.length === 0)
      return toast.error("Enter at least one finish position");
    record.mutate(
      { results },
      {
        onSuccess: () => toast.success("Results saved (provisional)"),
      },
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-subtle/40 p-4">
      <p className="text-xs text-muted">
        Admin override — save results without an OTP.
      </p>
      <Button loading={record.isPending} onClick={save}>
        Save results
      </Button>
    </div>
  );
}

function FinishTable({ raceId, results, canDelete, canInquiry }) {
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
    });
  }

  function raise(resultId) {
    inquiry.mutate(resultId, {
      onSuccess: () => toast.success("Result flagged for review"),
    });
  }

  return (
    <div className="overflow-x-auto">
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
          {results.order.map((o) => (
            <tr key={o.resultId} className="border-b border-border/60">
              <td className="px-2 py-2 font-semibold tabular-nums text-ink">
                {o.finishPosition ?? "—"}
              </td>
              <td className="px-2 py-2 tabular-nums text-muted">
                {o.entryNo ?? "—"}
              </td>
              <td className="px-2 py-2 font-medium text-ink">
                <span className="inline-flex items-center gap-2">
                  {o.horseName}
                  {o.officialityStatus === "UNDER_REVIEW" && (
                    <Badge tone="info">Under Review</Badge>
                  )}
                </span>
              </td>
              <td className="px-2 py-2 text-muted">{o.jockeyName ?? "—"}</td>
              <td className="px-2 py-2 text-right tabular-nums text-ink">
                {fmtMs(o.finishTimeMs)}
              </td>
              {showActions && (
                <td className="px-2 py-2 text-right">
                  {confirmId === o.resultId ? (
                    <span className="inline-flex items-center gap-1">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={del.isPending}
                        onClick={() => remove(o.resultId)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        Keep
                      </Button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-end gap-3">
                      {canInquiry && o.officialityStatus !== "UNDER_REVIEW" && (
                        <button
                          type="button"
                          onClick={() => raise(o.resultId)}
                          disabled={inquiry.isPending}
                          className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline disabled:opacity-50"
                        >
                          <ShieldQuestion size={13} /> Raise inquiry
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setConfirmId(o.resultId)}
                          className="inline-flex items-center gap-1 text-xs text-danger hover:underline"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminCertificationNote({ isOfficial }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-2">
        <h2 className="inline-flex items-center gap-2 font-semibold text-ink">
          <BadgeCheck
            size={16}
            className={isOfficial ? "text-success" : "text-muted"}
          />{" "}
          Certification
        </h2>
        {isOfficial ? (
          <p className="text-sm text-success">
            These results are certified OFFICIAL.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Your results are provisional. An <strong>admin</strong> reviews and
            certifies them as official — owners are notified once published.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function Tele({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

/**
 * All violations logged for this race, shown as part of the result. A newly filed violation
 * appears here immediately (the create mutation invalidates the shared violations query), and
 * once an inquiry is resolved the row reflects its RESOLVED/DISMISSED status.
 */
function RaceViolationsLog({ raceId }) {
  const { data, isPending, isError } = useRaceViolations(raceId || null);
  const violations = data ?? [];

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-semibold text-ink">
            <AlertTriangle size={16} className="text-muted" /> Violations
          </h2>
          {violations.length > 0 && (
            <Badge tone="neutral">{violations.length}</Badge>
          )}
        </div>
        {isPending ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : isError ? (
          <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
            Could not load violations.
          </p>
        ) : violations.length === 0 ? (
          <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
            No violations logged for this race.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {violations.map((v) => (
              <ViolationEntry key={v.violationId} item={v} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * One violation shown with its incident photo. Pending / under-review items can be resolved inline
 * (records the ruling → the row then reflects its RESOLVED/DISMISSED status). The photo + ruling come
 * from the violation detail; the list item supplies label/severity/status so the row renders instantly.
 */
function ViolationEntry({ item }) {
  const toast = useToast();
  const { data: detail } = useViolation(item.violationId);
  const ruling = useRecordRuling(item.violationId);
  const [open, setOpen] = useState(false);
  const [decisionType, setDecisionType] = useState("PENALTY_APPLIED");
  const [notes, setNotes] = useState("");
  const resolvable =
    item.status === "PENDING" || item.status === "UNDER_REVIEW";

  function resolve() {
    ruling.mutate(
      { decisionType, rulingNotes: notes.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Inquiry resolved");
          setOpen(false);
        },
      },
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-3">
      {/* Incident photo */}
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border bg-brand-900 text-white/60">
        {detail?.footageUrl ? (
          <a
            href={detail.footageUrl}
            target="_blank"
            rel="noreferrer"
            className="block h-full w-full"
          >
            <img
              src={detail.footageUrl}
              alt="Violation evidence"
              className="h-full w-full object-contain"
            />
          </a>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Video size={22} />
            <span className="text-[11px]">No photo attached</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Badge tone={SEVERITY_TONE[item.severity]}>{item.severity}</Badge>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {humanize(item.infractionType)}
          </p>
          <p className="truncate text-xs text-muted">
            {item.entityLabel}
            {item.turnNo != null ? ` · Turn ${item.turnNo}` : ""}
          </p>
        </div>
        <Badge
          tone={
            item.status === "RESOLVED"
              ? "success"
              : item.status === "DISMISSED"
                ? "neutral"
                : "warning"
          }
        >
          {humanize(item.status)}
        </Badge>
      </div>

      {/* Resolved → ruling summary; pending → inline resolve. */}
      {detail?.ruling ? (
        <p className="rounded-lg bg-subtle/50 px-3 py-2 text-xs text-muted">
          {humanize(detail.ruling.decisionType)}
          {detail.ruling.penaltyType
            ? ` · ${humanize(detail.ruling.penaltyType)}`
            : ""}
          {detail.ruling.penaltyValue ? ` (${detail.ruling.penaltyValue})` : ""}
        </p>
      ) : resolvable ? (
        !open ? (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Resolve inquiry
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )
      ) : null}
    </li>
  );
}
