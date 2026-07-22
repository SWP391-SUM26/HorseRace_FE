import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Trophy } from "lucide-react";
import {
  Card,
  CardBody,
  DataTable,
  EmptyState,
  Skeleton,
  Tabs,
} from "@/common/ui";
import { LiveRunningOrder, useLiveRace } from "@/common/live";
import { useRaceEntries, useRaceResults, useSpectatorRaces } from "../hooks";

function fmtClock(ms) {
  if (!ms || ms <= 0) return "0:00.00";
  const total = Math.floor(ms / 10); // centiseconds
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000);
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  return `${m}:${pad(s)}.${pad(cs)}`;
}

export default function SpectatorLivePage() {
  const { raceId = "" } = useParams();
  const [tab, setTab] = useState("odds");

  // Keep race status fresh (~15s) while on the live page so the fast live poll stops once the race finishes.
  const racesQuery = useSpectatorRaces({}, { refetchInterval: 15000 });
  const race = useMemo(
    () =>
      (racesQuery.data?.rows ?? []).find((r) => r.raceId === raceId) ?? null,
    [racesQuery.data, raceId],
  );
  const running = race?.status === "RUNNING";

  const liveQuery = useLiveRace(raceId, running);
  const entriesQuery = useRaceEntries(raceId);
  const resultsQuery = useRaceResults(raceId);

  const live = liveQuery.data;
  const entries = entriesQuery.data ?? [];
  const results = resultsQuery.data;
  const hasOfficialResults =
    !!results &&
    results.order.length > 0 &&
    results.officialityStatus === "OFFICIAL";

  const oddsColumns = [
    { key: "no", header: "#", render: (e) => e.entryNo ?? "—" },
    {
      key: "horse",
      header: "Horse",
      render: (e) => (
        <span className="font-medium text-ink">{e.horseName ?? "—"}</span>
      ),
    },
    { key: "odds", header: "Odds", render: (e) => e.odds ?? "—" },
  ];

  const resultColumns = [
    { key: "pos", header: "Pos", render: (r) => r.finishPosition ?? "—" },
    {
      key: "horse",
      header: "Horse",
      render: (r) => (
        <span className="font-medium text-ink">{r.horseName}</span>
      ),
    },
    { key: "jockey", header: "Jockey", render: (r) => r.jockeyName ?? "—" },
    {
      key: "time",
      header: "Time",
      render: (r) => (r.finishTimeMs ? fmtClock(r.finishTimeMs) : "—"),
    },
    { key: "odds", header: "Payout", render: (r) => r.odds ?? "—" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {running ? (
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />{" "}
              Live Now
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wide text-muted">
              {race?.status ?? "Race"}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {race?.name ?? race?.raceCode ?? "Live Race"}
          </h1>
          <p className="text-sm text-muted">
            {race?.raceType ?? "Race"} •{" "}
            {race?.distanceMeter ? `${race.distanceMeter}m` : "—"} •{" "}
            {race?.trackCondition ?? "Turf"}
          </p>
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-ink hover:bg-subtle"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {/* Video / hero block with clock overlay */}
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
                <span className="text-sm text-white/50">
                  No live video feed available
                </span>
              </div>
            )}
            <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-lg font-bold tabular-nums text-white">
              {fmtClock(live?.raceClockMs ?? null)}
            </div>
            {live && (live.windSpeedKph != null || live.windDirection) && (
              <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white">
                Wind {live.windSpeedKph ?? "—"} kph {live.windDirection ?? ""}
              </div>
            )}
          </div>

          {/* Live running order */}
          {liveQuery.isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : (
            <LiveRunningOrder
              runners={live?.runningOrder ?? []}
              running={running}
            />
          )}
        </div>

        {/* Right column: Live Odds | Jockey Stats + quick bet */}
        <div className="space-y-4">
          <Card>
            <CardBody>
              <Tabs
                tabs={[
                  { key: "odds", label: "Live Odds" },
                  { key: "jockey", label: "Jockey Stats" },
                ]}
                active={tab}
                onChange={setTab}
              />

              <div className="mt-4">
                {tab === "odds" ? (
                  <DataTable
                    rows={entries}
                    columns={oddsColumns}
                    rowKey={(e) => e.entryId}
                    loading={entriesQuery.isLoading}
                    emptyLabel="No odds available"
                  />
                ) : (
                  <p className="py-6 text-center text-sm text-muted">
                    Jockey performance analytics are a preview placeholder — no
                    per-jockey live-stats endpoint is wired yet.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          <Link
            to="/spectator/predictions"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-700 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Place Quick Bet
          </Link>
        </div>
      </div>

      {/* Official results & payouts — only when OFFICIAL */}
      {hasOfficialResults && (
        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
              <Trophy className="h-5 w-5 text-warning" /> Official Results &
              Payouts
            </h3>
            <DataTable
              rows={results.order}
              columns={resultColumns}
              rowKey={(r) => r.resultId}
            />
          </CardBody>
        </Card>
      )}

      {!race && !racesQuery.isLoading && (
        <EmptyState
          title="Race not found"
          description="This race is no longer available."
        />
      )}
    </div>
  );
}
