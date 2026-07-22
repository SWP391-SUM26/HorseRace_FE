import { Activity, ArrowRight } from "lucide-react";
import { Card } from "@/common/ui";
import { featuredHorse } from "@/mocks/home";
import silverStreak from "@/assets/silver-streak.png";

function MetricBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function VirtualPaddock() {
  const { name, grade, wins, races, winRate, metrics } = featuredHorse;

  return (
    <section className="bg-subtle py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Special Feature
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">
            The Virtual Paddock
          </h2>
          <p className="mt-3 text-muted">
            An immersive preview for every stakeholder. View elite athletes in
            high-fidelity before the gate opens.
          </p>
        </div>

        <Card className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl">
          <div className="grid md:grid-cols-2">
            {/* LEFT — horse photo */}
            <div className="relative min-h-72">
              <img
                src={silverStreak}
                alt={name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent p-6">
                <p className="text-sm text-white/70">{grade}</p>
                <p className="text-2xl font-bold uppercase text-white">
                  {name}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {wins} Wins · {races} Races · {winRate}% Win
                </p>
              </div>
            </div>

            {/* RIGHT — performance metrics */}
            <div className="bg-brand-800 p-8 text-white">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-50/90" />
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
              </div>

              <div className="mt-6 space-y-5">
                <MetricBar label="Stamina" value={metrics.stamina} />
                <MetricBar label="Speed" value={metrics.speed} />
                <MetricBar label="Temperament" value={metrics.temperament} />
              </div>

              <button
                type="button"
                className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                View Full Pedigree
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
