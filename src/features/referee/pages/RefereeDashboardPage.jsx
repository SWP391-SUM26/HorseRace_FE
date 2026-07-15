import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, Users, X } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
  StatCard,
} from "@/common/ui";
import { useInspections, useRefereeDashboard } from "../hooks";

/** seconds → "HH:MM:SS" */
function fmtCountdown(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

function severityTone(sev) {
  const s = sev?.toUpperCase();
  if (s === "HIGH" || s === "CRITICAL") return "danger";
  if (s === "MEDIUM") return "warning";
  return "neutral";
}

const INSPECTION_TONE = {
  CLEARED: "success",
  VET_CHECK: "warning",
  PENDING: "neutral",
};

export default function RefereeDashboardPage() {
  const { data, isPending, isError } = useRefereeDashboard();

  // Live-ticking countdown seeded from the BE value.
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    const seed = data?.nextRace?.postTimeCountdownSeconds ?? null;
    setRemaining(seed != null ? Math.max(0, seed) : null);
  }, [data?.nextRace?.postTimeCountdownSeconds]);
  useEffect(() => {
    if (remaining == null || remaining <= 0) return;
    const id = setInterval(
      () => setRemaining((r) => (r == null ? r : Math.max(0, r - 1))),
      1000,
    );
    return () => clearInterval(id);
  }, [remaining]);

  return (
    <>
      <PageHeader
        title="Live Operations Overview"
        subtitle="Race-day officiating at a glance."
        actions={<Badge tone="success">System Normal</Badge>}
      />

      {isPending ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError || !data ? (
        <EmptyState
          title="Could not load the dashboard"
          description="Please reload the page."
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Next race hero (dark emerald) */}
            <div className="flex flex-col rounded-2xl border border-brand-700 bg-brand-800 p-6 text-white shadow-sm lg:col-span-2">
              <p className="text-sm text-white/70">Next Race</p>
              {data.nextRace ? (
                <>
                  <div className="mt-1 flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {data.nextRace.name}
                    </h2>
                    <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold">
                      {data.nextRace.raceCode}
                    </span>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-wide text-white/60">
                    Time to post
                  </p>
                  <p className="text-4xl font-semibold tabular-nums">
                    {remaining != null && remaining > 0
                      ? fmtCountdown(remaining)
                      : "—"}
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    {remaining != null && remaining > 0
                      ? `Status: ${data.nextRace.status}`
                      : "Post time has passed."}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <Link
                      to="/app/referee/inspection"
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20"
                    >
                      <Users size={16} /> Pre-Race Inspection
                    </Link>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-white/70">
                  No upcoming race scheduled.
                </p>
              )}
            </div>

            {/* Priority alerts */}
            <Card>
              <CardBody className="flex flex-col gap-3">
                <h2 className="font-semibold text-ink">Priority Alerts</h2>
                {data.alerts.length === 0 ? (
                  <p className="text-sm text-muted">No active alerts.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.alerts.map((a, i) => (
                      <li
                        key={a.refId ?? `${a.type}-${i}`}
                        className="flex items-start gap-2 rounded-xl border border-border bg-subtle/40 p-3"
                      >
                        <AlertTriangle
                          size={16}
                          className="mt-0.5 shrink-0 text-warning"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-ink">{a.label}</p>
                          <Badge tone={severityTone(a.severity)}>
                            {a.severity}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Inspection summary KPIs */}
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Cleared"
              value={data.inspectionSummary.cleared}
              hint="Inspections"
            />
            <StatCard
              label="Pending"
              value={data.inspectionSummary.pending}
              hint="Inspections"
            />
            <StatCard
              label="Vet Check"
              value={data.inspectionSummary.vetCheck}
              hint="Inspections"
            />
            <StatCard
              label="Total Runners"
              value={data.inspectionSummary.total}
            />
          </div>

          {/* Pre-Race Inspections mini-table for the next race */}
          <div className="mt-6">
            <InspectionMiniTable raceId={data.nextRace?.raceId ?? null} />
          </div>

          {/* Duty roster */}
          <div className="mt-6">
            <Card>
              <CardBody className="flex flex-col gap-3">
                <h2 className="font-semibold text-ink">Duty Roster</h2>
                {data.dutyRoster.length === 0 ? (
                  <p className="text-sm text-muted">No stewards assigned.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.dutyRoster.map((d) => (
                      <li
                        key={d.refereeUserId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5"
                      >
                        <span className="text-sm font-medium text-ink">
                          {d.refereeName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge tone="info">{d.panelRole}</Badge>
                          <span className="text-xs text-muted">
                            {d.station ?? "—"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </>
  );
}

function InspectionMiniTable({ raceId }) {
  const query = useInspections(raceId);
  const rows = query.data ?? [];

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Pre-Race Inspections</h2>
          <Link
            to="/app/referee/inspection"
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Open inspection sheet →
          </Link>
        </div>

        {!raceId ? (
          <p className="text-sm text-muted">No upcoming race to inspect.</p>
        ) : query.isPending ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : query.isError ? (
          <p className="text-sm text-muted">Could not load inspections.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted">
            No runners declared for this race yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">No</th>
                  <th className="py-2 pr-3 font-medium">Horse / Jockey</th>
                  <th className="py-2 pr-3 font-medium">Equipment</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.entryId}>
                    <td className="py-2.5 pr-3 font-mono text-muted">
                      {r.laneNo ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-ink">{r.horseName}</p>
                      <p className="text-xs text-muted">
                        {r.jockeyName ?? "—"}
                      </p>
                    </td>
                    <td className="py-2.5 pr-3">
                      {r.weightVerified ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted">
                          <X size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={INSPECTION_TONE[r.inspectionStatus]}>
                        {r.inspectionStatus.replace("_", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
