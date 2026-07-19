import { useState } from "react";
import { AlertTriangle, BadgeCheck, FileText, Trophy } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Skeleton, Textarea } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { useToast } from "@/common/providers/ToastProvider";
import { useCertifyRaceResults, useRaceReportViolations, useRaceResultSheet } from "../hooks";

function fmtTime(ms) {
  if (ms == null) return "—";
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec - minutes * 60;
  return minutes > 0 ? `${minutes}:${seconds.toFixed(2).padStart(5, "0")}` : `${seconds.toFixed(2)}s`;
}

function officialTone(status) {
  if (status === "OFFICIAL") return "success";
  if (status === "PROVISIONAL") return "warning";
  return "neutral";
}

function severityTone(status) {
  const upper = (status || "").toUpperCase();
  if (upper.includes("SEVERE") || upper.includes("CRITICAL") || upper.includes("MAJOR")) return "danger";
  if (upper.includes("MODERATE") || upper.includes("MEDIUM")) return "warning";
  return "neutral";
}

function humanize(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const PODIUM = ["bg-amber-50 text-warning", "bg-subtle text-muted", "bg-orange-50 text-orange-600"];
const PLACE = ["1st", "2nd", "3rd"];

/**
 * Read-only race report: results sheet + stewards' report + logged violations.
 * When `canCertify` is set (admin), an admin can publish provisional results
 * as OFFICIAL.
 */
export function RaceReportView({ raceId, canCertify = false }) {
  const { data: results, isPending, isError } = useRaceResultSheet(raceId);
  const { data: violations } = useRaceReportViolations(raceId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load the report" description="Please try again." />;
  }

  if (!results || !results.order || results.order.length === 0) {
    return (
      <EmptyState
        title="Results not published yet"
        description="The race report appears here once the referee records and certifies the results."
      />
    );
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
          {canCertify && results.officialityStatus !== "OFFICIAL" && <CertifyControl raceId={raceId} />}
        </CardBody>
      </Card>

      {/* Podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((row, index) => (
          <div key={row.resultId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", PODIUM[index])}>
              {index === 0 ? <Trophy className="h-5 w-5" /> : row.finishPosition}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{PLACE[index]}</p>
              <p className="truncate font-semibold text-ink">{row.horseName}</p>
              <p className="truncate text-xs text-muted">{row.jockeyName ?? "—"} · {fmtTime(row.finishTimeMs)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Full finishing order */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-ink">Finishing Order</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2">Pos</th>
                  <th className="px-4 py-2">Horse</th>
                  <th className="px-4 py-2">Jockey</th>
                  <th className="px-4 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {order.map((row) => <ResultRow key={row.resultId} row={row} />)}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Stewards' report */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted" />
          <h3 className="font-semibold text-ink">Stewards' Report</h3>
        </CardHeader>
        <CardBody>
          {results.stewardsReport ? (
            <p className="whitespace-pre-wrap text-sm text-ink">{results.stewardsReport}</p>
          ) : (
            <p className="text-sm text-muted">No stewards' report was filed for this race.</p>
          )}
        </CardBody>
      </Card>

      {/* Violations / incidents */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted" />
            <h3 className="font-semibold text-ink">Violations & Incidents</h3>
          </span>
          <span className="text-xs text-muted">{violations?.length ?? 0} logged</span>
        </CardHeader>
        <CardBody>
          {!violations || violations.length === 0 ? (
            <p className="text-sm text-muted">No violations were recorded — a clean race.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {violations.map((violation) => (
                <li key={violation.violationId} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Badge tone={severityTone(violation.severity)}>{humanize(violation.severity)}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{humanize(violation.infractionType)}</p>
                    <p className="truncate text-xs text-muted">
                      {violation.entityLabel}
                      {violation.turnNo != null ? ` · Turn ${violation.turnNo}` : ""}
                    </p>
                  </div>
                  <Badge tone="neutral">{humanize(violation.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ResultRow({ row }) {
  const top = row.finishPosition === 1;

  return (
    <tr className={cn("border-b border-border last:border-0", top && "bg-brand-50/40")}>
      <td className="px-4 py-2.5">
        <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", top ? "bg-brand-700 text-white" : "bg-subtle text-ink")}>
          {row.finishPosition ?? "—"}
        </span>
      </td>
      <td className="px-4 py-2.5 font-medium text-ink">{row.horseName}</td>
      <td className="px-4 py-2.5 text-muted">{row.jockeyName ?? "—"}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{fmtTime(row.finishTimeMs)}</td>
    </tr>
  );
}

/**
 * Admin-only publish control: certify the referee's provisional results as
 * OFFICIAL.
 */
function CertifyControl({ raceId }) {
  const toast = useToast();
  const certify = useCertifyRaceResults(raceId);
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState("");

  function submit() {
    certify.mutate(report, {
      onSuccess: () => {
        toast.success("Results certified official");
        setOpen(false);
      },
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
            onChange={(event) => setReport(event.target.value)}
            placeholder="Optional stewards' report appended to the permanent record..."
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)} disabled={certify.isPending}>
              Cancel
            </Button>
            <Button size="sm" loading={certify.isPending} onClick={submit}>
              Confirm &amp; Publish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
