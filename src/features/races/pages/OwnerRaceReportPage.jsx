import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Card, CardBody, EmptyState, Select, Skeleton } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useOwnerRaceReport } from "../hooks";

const humanize = (value) =>
  !value ? "-" : value.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

function fmtMs(ms) {
  if (ms == null) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  const pad = (n) => String(n).padStart(2, "0");
  return `${minutes}:${pad(seconds)}.${pad(centiseconds)}`;
}

function notRunReason(row) {
  if (row.entered && row.entryStatus === "SCRATCHED") return "Scratched";
  switch (row.registrationStatus) {
    case "REJECTED":
      return row.rejectionReason ? `Rejected - ${row.rejectionReason}` : "Registration rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    case "SUBMITTED":
    case "UNDER_REVIEW":
      return "Awaiting approval";
    case "DRAFT":
      return "Draft (not submitted)";
    case "APPROVED":
      return "Approved but not entered";
    default:
      return humanize(row.registrationStatus);
  }
}

export default function OwnerRaceReportPage() {
  const { data, isPending, isError } = useOwnerRaceReport();
  const [raceId, setRaceId] = useState("");

  const races = useMemo(() => {
    const map = new Map();
    for (const row of data ?? []) {
      if (row.raceId && !map.has(row.raceId)) map.set(row.raceId, row);
    }
    return [...map.values()].sort(
      (a, b) => +new Date(b.scheduledStartAt ?? 0) - +new Date(a.scheduledStartAt ?? 0)
    );
  }, [data]);

  const selectedRaceId = raceId || races[0]?.raceId || "";
  const rows = useMemo(() => (data ?? []).filter((row) => row.raceId === selectedRaceId), [data, selectedRaceId]);
  const ran = rows.filter((row) => row.participated);
  const didNotRun = rows.filter((row) => !row.participated);
  const race = races.find((row) => row.raceId === selectedRaceId);

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
              value={selectedRaceId}
              onChange={(event) => setRaceId(event.target.value)}
              options={races.map((row) => ({
                value: row.raceId,
                label: `${row.raceCode ?? row.raceId.slice(0, 6)} - ${row.raceName ?? "Race"}`
              }))}
            />
          </div>

          {race && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-subtle/60 px-3 py-2 text-sm">
              <span className="font-semibold text-ink">{race.raceName ?? race.raceCode}</span>
              {race.tournamentName && <span className="text-muted">- {race.tournamentName}</span>}
              {race.raceStatus && <Badge tone="neutral">{humanize(race.raceStatus)}</Badge>}
              {race.scheduledStartAt && <span className="ml-auto text-xs text-muted">{formatDate(race.scheduledStartAt)}</span>}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
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
                      {ran.map((row) => (
                        <tr key={row.registrationId}>
                          <td className="px-2 py-2 font-medium text-ink">{row.horseName ?? "-"}</td>
                          <td className="px-2 py-2">
                            <Badge
                              tone={
                                row.entryStatus === "FINISHED"
                                  ? "success"
                                  : row.entryStatus === "SCRATCHED" || row.entryStatus === "DISQUALIFIED"
                                    ? "danger"
                                    : "neutral"
                              }
                            >
                              {humanize(row.entryStatus)}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums text-ink">{row.finishPosition ?? "-"}</td>
                          <td className="px-2 py-2 text-right tabular-nums text-muted">{fmtMs(row.finishTimeMs)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h2 className="mb-3 inline-flex items-center gap-2 font-semibold text-ink">
                  <XCircle size={17} className="text-muted" /> Registered - did not run ({didNotRun.length})
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
                      {didNotRun.map((row) => (
                        <tr key={row.registrationId}>
                          <td className="px-2 py-2 font-medium text-ink">{row.horseName ?? "-"}</td>
                          <td className="px-2 py-2">
                            <Badge tone={row.registrationStatus === "REJECTED" || row.registrationStatus === "WITHDRAWN" ? "danger" : "warning"}>
                              {humanize(row.registrationStatus)}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-muted">{notRunReason(row)}</td>
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
