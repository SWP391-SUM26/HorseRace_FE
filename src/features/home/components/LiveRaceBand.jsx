import { Trophy } from "lucide-react";
import { Card, CardBody, Badge } from "@/common/ui";
import { liveRace, marketLeaders, aiInsight, leaderboard } from "@/mocks/home";

export function LiveRaceBand() {
  return (
    <section className="bg-bg">
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT — Live race + market leaders (spans 2 cols) */}
          <Card className="lg:col-span-2">
            <CardBody className="space-y-5">
              {/* Top row: live status + next post time */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="relative mt-1.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">
                      Live: {liveRace.event}
                    </p>
                    <p className="text-sm text-muted">
                      {liveRace.location} · Track: {liveRace.going}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Next Post Time
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-ink">
                    {liveRace.nextPostTime}
                  </p>
                </div>
              </div>

              <hr className="border-border" />

              {/* Market leaders */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-muted">
                  Market Leaders ({liveRace.raceLabel})
                </p>
                <ul className="space-y-3">
                  {marketLeaders.map((leader) => (
                    <li key={leader.rank} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtle text-sm font-semibold text-ink">
                        {leader.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">{leader.horse}</p>
                        <p className="text-xs text-muted">{leader.jockey}</p>
                      </div>
                      <Badge tone="neutral">{leader.odds}</Badge>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI predictor callout */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-4">
                <div className="flex items-start gap-3">
                  <Badge tone="success">AI</Badge>
                  <p className="text-sm text-ink">{aiInsight.text}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
                  {aiInsight.winPct}% WIN
                </span>
              </div>
            </CardBody>
          </Card>

          {/* RIGHT — Global leaderboard (dark card) */}
          <Card className="border-brand-700 bg-brand-800 text-white">
            <CardBody className="flex h-full flex-col">
              <p className="text-sm font-semibold text-white/90">
                ✦ Global Leaderboard
              </p>

              <ul className="mt-5 flex-1 space-y-4">
                {leaderboard.map((entry) => (
                  <li key={entry.rank} className="flex items-center gap-3">
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
