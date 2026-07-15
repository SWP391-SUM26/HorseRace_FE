import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge, Card, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import { useOwnerRaceIds, useRaceCalendar, useRefereeRaceIds } from "../hooks";
import { RaceReportView } from "../components/RaceReportView";

const REPORTABLE = new Set(["FINISHED", "OFFICIAL"]);

const COPY = {
  owner: { title: "Race Results", subtitle: "Results and stewards' reports for races your horses ran in." },
  admin: { title: "Race Reports", subtitle: "Results, stewards' reports and violations across every race." },
  referee: { title: "Race Reports", subtitle: "Published results and reports for completed races." },
};

function statusTone(status) {
  return status === "OFFICIAL" ? "success" : "neutral";
}

export default function RaceReportPage({ scope }) {
  const { data: allRaces, isPending } = useRaceCalendar();
  const ownerIds = useOwnerRaceIds({ enabled: scope === "owner" });
  const refereeIds = useRefereeRaceIds({ enabled: scope === "referee" });
  const [selectedId, setSelectedId] = useState(null);

  const restricted = scope === "owner" || scope === "referee";
  const restrictIds = scope === "owner" ? ownerIds.data : scope === "referee" ? refereeIds.data : undefined;
  const restrictedPending = restricted && restrictIds === undefined;

  const races = useMemo(() => {
    let list = (allRaces ?? []).filter((race) => REPORTABLE.has(race.status));
    if (restricted) {
      const ids = new Set(restrictIds ?? []);
      list = list.filter((race) => ids.has(race.raceId));
    }
    return [...list].sort((a, b) => +new Date(b.scheduledStartAt ?? 0) - +new Date(a.scheduledStartAt ?? 0));
  }, [allRaces, restricted, restrictIds]);

  const selected = races.find((race) => race.raceId === selectedId) ?? races[0];
  const copy = COPY[scope] ?? COPY.admin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
      </div>

      {isPending || restrictedPending ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : races.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState title="No completed races yet" description="Reports appear once races finish and results are recorded." />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-1">
            {races.map((race) => (
              <RaceRow
                key={race.raceId}
                race={race}
                active={selected?.raceId === race.raceId}
                onSelect={() => setSelectedId(race.raceId)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <RaceReportView raceId={selected.raceId} canCertify={scope === "admin"} />
            ) : (
              <Card>
                <CardBody>
                  <EmptyState title="Select a race" description="Pick a race to view its report." />
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RaceRow({ race, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border bg-surface p-4 text-left transition-colors",
        active ? "border-brand-700 ring-1 ring-brand-700" : "border-border hover:border-brand-700/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate font-semibold text-ink">{race.name}</h3>
        <Badge tone={statusTone(race.status)}>{race.status === "OFFICIAL" ? "OFFICIAL" : "FINISHED"}</Badge>
      </div>
      {race.tournamentName && <p className="mt-0.5 truncate text-xs text-muted">{race.tournamentName}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {race.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {race.venue}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {race.scheduledStartAt ? formatDate(race.scheduledStartAt) : "—"}
        </span>
      </div>
    </button>
  );
}
