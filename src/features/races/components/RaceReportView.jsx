import { useState } from "react";
import { Card, CardBody, CardHeader, Badge, Button, Skeleton, EmptyState, Textarea } from "@/common/ui";
import { Trophy, AlertTriangle, FileText, BadgeCheck } from "lucide-react";
import { cn } from "@/common/lib/cn";
import { useToast } from "@/common/providers/ToastProvider";
import { useRaceResultSheet, useRaceReportViolations, useCertifyRaceResults } from "../hooks";
function fmtTime(ms) {
  if (ms == null) return "\u2014";
  const totalSec = ms / 1e3;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return m > 0 ? `${m}:${s.toFixed(2).padStart(5, "0")}` : `${s.toFixed(2)}s`;
}
function officialTone(s) {
  if (s === "OFFICIAL") return "success";
  if (s === "PROVISIONAL") return "warning";
  return "neutral";
}
function severityTone(s) {
  const u = (s || "").toUpperCase();
  if (u.includes("SEVERE") || u.includes("CRITICAL") || u.includes("MAJOR")) return "danger";
  if (u.includes("MODERATE") || u.includes("MEDIUM")) return "warning";
  return "neutral";
}
const humanize = (v) => v.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const PODIUM = ["bg-amber-50 text-warning", "bg-subtle text-muted", "bg-orange-50 text-orange-600"];
const PLACE = ["1st", "2nd", "3rd"];
function RaceReportView({ raceId, canCertify = false }) {
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
  return <div className="flex flex-col gap-6">
      {
    /* Status + conditions */
  }
      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Race Result</h2>
            <Badge tone={officialTone(results.officialityStatus)}>{humanize(results.officialityStatus)}</Badge>
          </div>
          {canCertify && results.officialityStatus !== "OFFICIAL" && <CertifyControl raceId={raceId} />}
        </CardBody>
      </Card>

      {
    /* Podium */
  }
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((r, i) => <div key={r.resultId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", PODIUM[i])}>
              {i === 0 ? <Trophy className="h-5 w-5" /> : r.finishPosition}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{PLACE[i]}</p>
              <p className="truncate font-semibold text-ink">{r.horseName}</p>
              <p className="truncate text-xs text-muted">{r.jockeyName ?? "\u2014"} · {fmtTime(r.finishTimeMs)}</p>
            </div>
          </div>)}
      </div>

      {
    /* Full finishing order */
  }
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
                </tr>
              </thead>
              <tbody>
                {order.map((r) => <ResultRow key={r.resultId} r={r} />)}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {
    /* Stewards' report */
  }
      <Card>
        <CardHeader className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted" /><h3 className="font-semibold text-ink">Stewards' Report</h3></CardHeader>
        <CardBody>
          {results.stewardsReport ? <p className="whitespace-pre-wrap text-sm text-ink">{results.stewardsReport}</p> : <p className="text-sm text-muted">No stewards' report was filed for this race.</p>}
        </CardBody>
      </Card>

      {
    /* Violations / incidents */
  }
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-muted" /><h3 className="font-semibold text-ink">Violations & Incidents</h3></span>
          <span className="text-xs text-muted">{violations?.length ?? 0} logged</span>
        </CardHeader>
        <CardBody>
          {!violations || violations.length === 0 ? <p className="text-sm text-muted">No violations were recorded — a clean race.</p> : <ul className="flex flex-col gap-2">
              {violations.map((v) => <li key={v.violationId} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Badge tone={severityTone(v.severity)}>{humanize(v.severity)}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{humanize(v.infractionType)}</p>
                    <p className="truncate text-xs text-muted">{v.entityLabel}{v.turnNo != null ? ` \xB7 Turn ${v.turnNo}` : ""}</p>
                  </div>
                  <Badge tone="neutral">{humanize(v.status)}</Badge>
                </li>)}
            </ul>}
        </CardBody>
      </Card>
    </div>;
}
function ResultRow({ r }) {
  const top = r.finishPosition === 1;
  return <tr className={cn("border-b border-border last:border-0", top && "bg-brand-50/40")}>
      <td className="px-4 py-2.5">
        <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", top ? "bg-brand-700 text-white" : "bg-subtle text-ink")}>
          {r.finishPosition ?? "\u2014"}
        </span>
      </td>
      <td className="px-4 py-2.5 font-medium text-ink">{r.horseName}</td>
      <td className="px-4 py-2.5 text-muted">{r.jockeyName ?? "\u2014"}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{fmtTime(r.finishTimeMs)}</td>
    </tr>;
}
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
      }
    });
  }
  return <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink">
          <strong>Provisional</strong> — publish these results as the official outcome.
        </p>
        {!open && <Button size="sm" leftIcon={<BadgeCheck size={15} />} onClick={() => setOpen(true)}>
            Certify as Official
          </Button>}
      </div>
      {open && <div className="mt-3 flex flex-col gap-2">
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
        </div>}
    </div>;
}
export {
  RaceReportView
};
