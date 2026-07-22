import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Trophy, Radio } from "lucide-react";
import { Card, CardBody, DataTable, EmptyState, Skeleton } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useSpectatorRaces, useTopPredictors } from "../hooks";
import { canPredict } from "../constants";
import { Countdown } from "../components/Countdown";
import { RaceCard } from "../components/RaceCard";

function fmtDateTime(iso) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SpectatorHubPage() {
  const navigate = useNavigate();
  const racesQuery = useSpectatorRaces();
  const predictorsQuery = useTopPredictors(4);
  const races = racesQuery.data?.rows ?? [];

  // Bettability filter: the "Race of the Day" hero leads users to bet, so surface only a race whose
  // BettingPanel will actually accept a prediction (CLOSED, locked, pre-cutoff) — via canPredict.
  const featured = useMemo(
    () => races.find((r) => canPredict(r)) ?? null,
    [races],
  );
  // Lifecycle-descriptive filters (NOT bettability) — left as-is.
  const liveRaces = useMemo(
    () => races.filter((r) => r.status === "RUNNING" || r.status === "OPEN"),
    [races],
  );
  const upcoming = useMemo(
    () =>
      races
        .filter((r) => r.status === "SCHEDULED" || r.status === "OPEN")
        .slice(0, 5),
    [races],
  );

  const scheduleColumns = [
    {
      key: "when",
      header: "Date & Time",
      render: (r) => fmtDateTime(r.scheduledStartAt),
    },
    {
      key: "event",
      header: "Event & Track",
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.name ?? r.raceCode}</p>
          <p className="text-xs text-muted">{r.venueName ?? r.venue ?? "—"}</p>
        </div>
      ),
    },
    { key: "grade", header: "Grade", render: (r) => r.raceType ?? "—" },
    {
      key: "purse",
      header: "Purse",
      render: (r) =>
        r.totalPurse ? `${r.totalPurse.toLocaleString("vi-VN")} ₫` : "—",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sảnh"
        subtitle="Featured races, live action, and today's tournament at a glance."
      />

      {/* (a) Hero — Race of the Day */}
      {racesQuery.isLoading ? (
        <Skeleton className="h-56 w-full rounded-2xl" />
      ) : featured ? (
        <div className="overflow-hidden rounded-2xl bg-slate-900 text-white">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                <Star className="h-3.5 w-3.5" /> Race of the Day
              </span>
              <h2 className="mt-4 text-3xl font-bold">
                {featured.name ?? featured.raceCode}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {featured.venueName ?? featured.venue ?? "Venue TBD"} •{" "}
                {featured.raceType ?? "Feature"} •{" "}
                {featured.distanceMeter ? `${featured.distanceMeter}m` : "—"}
              </p>
              <div className="mt-5">
                <Countdown target={featured.scheduledStartAt} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    navigate(`/spectator/predictions?raceId=${featured.raceId}`)
                  }
                  className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Place Prediction
                </button>
                <Link
                  to={`/spectator/predictions?raceId=${featured.raceId}`}
                  className="flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  View Field
                </Link>
              </div>
            </div>
            <div className="hidden items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-slate-800 lg:flex">
              <Trophy className="h-24 w-24 text-white/30" />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No featured race"
          description="There are no upcoming races scheduled right now."
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* (b) Live Now */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
              <Radio className="h-5 w-5 text-danger" /> Live Now
            </h3>
          </div>
          {racesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : liveRaces.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {liveRaces.map((r) => (
                <RaceCard
                  key={r.raceId}
                  race={r}
                  live={r.status === "RUNNING"}
                  to={
                    r.status === "RUNNING"
                      ? `/spectator/live-races/${r.raceId}`
                      : `/spectator/predictions?raceId=${r.raceId}`
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing live right now"
              description="Check back when a race is under way."
            />
          )}
        </div>

        {/* (c) Top Predictors — real ranking from GET /standings/predictors */}
        <Card>
          <CardBody>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Trophy className="h-4 w-4 text-warning" /> Top Predictors
            </h3>
            <p className="mb-3 text-xs text-muted">Ranked by winnings paid out</p>
            {predictorsQuery.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : predictorsQuery.isError ? (
              <p className="text-sm text-muted">Could not load the leaderboard.</p>
            ) : (predictorsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">No tickets have been settled yet.</p>
            ) : (
              <ul className="space-y-3">
                {(predictorsQuery.data ?? []).map((p) => (
                  <li key={p.jockeyUserId} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-subtle text-sm font-semibold text-ink">
                      {p.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted">
                        Won {p.wins}/{p.starts} tickets
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-brand-700">
                      {Math.round(p.earnings).toLocaleString("vi-VN")}₫
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* (d) Tournament at a Glance */}
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">
              Tournament at a Glance
            </h3>
            <Link
              to="/spectator/predictions"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Full Calendar
            </Link>
          </div>
          <DataTable
            rows={upcoming}
            columns={scheduleColumns}
            rowKey={(r) => r.raceId}
            loading={racesQuery.isLoading}
            emptyLabel="No upcoming races"
          />
        </CardBody>
      </Card>
    </div>
  );
}
