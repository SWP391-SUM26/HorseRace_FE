import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Radio, Wind } from "lucide-react";
import { Card, CardBody, DataTable, EmptyState, Skeleton } from "@/common/ui";
import {
  LiveRunningOrder,
  useLiveLeaderboard,
  useLiveRace,
} from "@/common/live";
import { useRaceEntries } from "@/features/spectator/hooks";
import { useRefereeRaceById, useRefereeRaces } from "../hooks";

function fmtClock(ms) {
  if (!ms || ms <= 0) return "0:00.00";
  const total = Math.floor(ms / 10); // centiseconds
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000);
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  return `${m}:${pad(s)}.${pad(cs)}`;
}

export default function LiveRaceMonitorPage() {
  const { raceId: routeRaceId } = useParams();

  // Scope to THIS referee's assigned races; poll ~10s so status stays fresh and the fast live poll
  // stops the moment the race leaves RUNNING.
  const racesQuery = useRefereeRaces({ refetchInterval: 10000 });
  // A deep-linked race may sit outside the scoped list's capped window — fetch it directly.
  const routeRaceQuery = useRefereeRaceById(routeRaceId ?? null);

  // Officiate a specific race (route param, fetched directly) or default to the referee's own
  // RUNNING assigned race — falling back to their first assigned race if none is RUNNING.
  const race = useMemo(() => {
    if (routeRaceId) {
      const r = routeRaceQuery.data;
      return r
        ? {
            raceId: r.raceId,
            raceCode: r.raceCode,
            name: r.name,
            status: r.status,
            raceType: r.raceType,
            distanceMeter: r.distanceMeter,
            tournamentName: r.tournamentName,
          }
        : null;
    }
    const assigned = racesQuery.data ?? [];
    const pick =
      assigned.find((r) => r.status === "RUNNING") ?? assigned[0] ?? null;
    return pick
      ? {
          raceId: pick.raceId,
          raceCode: pick.raceCode,
          name: pick.name,
          status: pick.status,
          raceType: null,
          distanceMeter: null,
          tournamentName: null,
        }
      : null;
  }, [routeRaceId, routeRaceQuery.data, racesQuery.data]);

  const raceId = race?.raceId ?? null;
  const running = race?.status === "RUNNING";

  const liveQuery = useLiveRace(raceId, running);
  const leaderboardQuery = useLiveLeaderboard(raceId, running);
  const entriesQuery = useRaceEntries(raceId);

  const live = liveQuery.data;
  const entries = entriesQuery.data ?? [];

  const oddsColumns = [
    { key: "no", header: "#", render: (e) => e.entryNo ?? "—" },
    {
      key: "horse",
      header: "Horse",
      render: (e) => (
        <span className="font-medium text-ink">{e.horseName ?? "—"}</span>
      ),
    },
    { key: "jockey", header: "Jockey", render: (e) => e.jockeyName ?? "—" },
    { key: "odds", header: "Odds", render: (e) => e.odds ?? "—" },
  ];

  const loading = routeRaceId ? routeRaceQuery.isLoading : racesQuery.isPending;

  if (!race && !loading) {
    const noAssignments = !routeRaceId && (racesQuery.data?.length ?? 0) === 0;
    return (
      <EmptyState
        title="No race to monitor"
        description={
          noAssignments
            ? "You have no assigned races to officiate. When an admin assigns you to a race, it appears here to monitor live."
            : "This race is not available to monitor. Open a race from your assignments to monitor it live."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {running ? (
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />{" "}
              Live — Officiating
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wide text-muted">
              {race?.status ?? "Race"}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {race?.name ?? race?.raceCode ?? "Live Race Monitor"}
          </h1>
          <p className="text-sm text-muted">
            {race?.raceType ?? "Race"} •{" "}
            {race?.distanceMeter ? `${race.distanceMeter}m` : "—"} •{" "}
            {race?.tournamentName ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {/* Video / hero block with race-clock + wind telemetry overlay */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
            {live?.videoFeedUrl ? (
              <iframe
                title="Live feed"
                src={live.videoFeedUrl}
                className="h-full w-full"
                allow="autoplay; fullscreen"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-800 to-slate-900">
                <span className="flex items-center gap-2 text-sm text-white/50">
                  <Radio className="h-4 w-4" /> No live video feed available
                </span>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-lg font-bold tabular-nums text-white">
              {fmtClock(live?.raceClockMs ?? null)}
            </div>
            {live && (live.windSpeedKph != null || live.windDirection) && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white">
                <Wind className="h-3.5 w-3.5" /> {live.windSpeedKph ?? "—"} kph{" "}
                {live.windDirection ?? ""}
              </div>
            )}
          </div>

          {/* Live running order (from the officiating snapshot / leaderboard) */}
          {liveQuery.isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : (
            <LiveRunningOrder
              runners={live?.runningOrder ?? leaderboardQuery.data ?? []}
              running={running}
            />
          )}
        </div>

        {/* Right column: telemetry summary + entered field */}
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-ink">Telemetry</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Race clock</dt>
                  <dd className="font-mono font-semibold tabular-nums text-ink">
                    {fmtClock(live?.raceClockMs ?? null)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Wind speed</dt>
                  <dd className="text-ink">
                    {live?.windSpeedKph != null
                      ? `${live.windSpeedKph} kph`
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Wind direction</dt>
                  <dd className="text-ink">{live?.windDirection ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Runners</dt>
                  <dd className="text-ink">
                    {live?.runningOrder?.length ?? entries.length}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-ink">Field</h3>
              <DataTable
                rows={entries}
                columns={oddsColumns}
                rowKey={(e) => e.entryId}
                loading={entriesQuery.isLoading}
                emptyLabel="No entries"
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
