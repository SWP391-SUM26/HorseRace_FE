import { Trophy } from "lucide-react";
import { Card, CardBody, Badge, Skeleton, EmptyState } from "@/common/ui";
import {
  useFeaturedRace,
  useMarketLeaders,
  useGlobalLeaderboard,
} from "../hooks";
import { Countdown } from "@/features/spectator/components/Countdown";

export function LiveRaceBand() {
  const raceQuery = useFeaturedRace();
  const race = raceQuery.data;
  const leadersQuery = useMarketLeaders(race?.raceId);
  const leaderboardQuery = useGlobalLeaderboard();

  return (
    <section className="bg-bg">
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT — Live race + market leaders (spans 2 cols) */}
          <Card className="lg:col-span-2">
            <CardBody className="space-y-5">
              {raceQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : !race ? (
                <EmptyState
                  title="No races scheduled"
                  description="Check back soon for the next race."
                />
              ) : (
                <>
                  {/* Top row: live status + next post time */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="relative mt-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
                      </span>
                      <div>
                        <p className="font-semibold text-ink">
                          {race.status === "RUNNING" ? "Live: " : "Next: "}
                          {race.name ?? race.raceCode}
                        </p>
                        <p className="text-sm text-muted">
                          {race.venueName ?? race.venue ?? "Venue TBD"} · Track:{" "}
                          {race.trackCondition ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {race.status === "RUNNING"
                          ? "Now Running"
                          : "Next Post Time"}
                      </p>
                      {race.status !== "RUNNING" && (
                        <p className="text-2xl">
                          <Countdown
                            target={race.scheduledStartAt}
                            variant="inline"
                          />
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Market leaders */}
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-wide text-muted">
                      Market Leaders ({race.raceCode})
                    </p>
                    {leadersQuery.isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : !leadersQuery.data?.length ? (
                      <p className="text-sm text-muted">
                        Field not confirmed yet.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {leadersQuery.data.map((leader) => (
                          <li
                            key={leader.rank}
                            className="flex items-center gap-3"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtle text-sm font-semibold text-ink">
                              {leader.rank}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-ink">
                                {leader.horse}
                              </p>
                              <p className="text-xs text-muted">
                                {leader.jockey}
                              </p>
                            </div>
                            <Badge tone="neutral">{leader.odds}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* RIGHT — Global leaderboard (dark card) */}
          <Card className="border-brand-700 bg-brand-800 text-white">
            <CardBody className="flex h-full flex-col">
              <p className="text-sm font-semibold text-white/90">
                ✦ Global Leaderboard
              </p>

              {leaderboardQuery.isLoading ? (
                <div className="mt-5 space-y-4">
                  <Skeleton className="h-10 w-full bg-white/10" />
                  <Skeleton className="h-10 w-full bg-white/10" />
                </div>
              ) : !leaderboardQuery.data?.length ? (
                <p className="mt-5 text-sm text-white/60">
                  No settled results yet.
                </p>
              ) : (
                <ul className="mt-5 flex-1 space-y-4">
                  {leaderboardQuery.data.map((entry) => (
                    <li
                      key={`${entry.role}-${entry.rank}`}
                      className="flex items-center gap-3"
                    >
                      <span className="font-mono text-sm text-white/50">
                        {entry.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{entry.name}</p>
                        <p className="text-xs text-white/60">{entry.role}</p>
                      </div>
                      <Trophy className="h-4 w-4 text-brand-50/80" />
                    </li>
                  ))}
                </ul>
              )}

              <a
                href="#"
                className="mt-6 inline-block text-sm text-white/70 transition-colors hover:text-white"
              >
                View All Rankings →
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
