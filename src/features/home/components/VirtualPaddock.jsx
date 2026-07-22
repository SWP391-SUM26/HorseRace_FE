import { Activity, ArrowRight } from "lucide-react";
import { Card, Skeleton, EmptyState } from "@/common/ui";
import { useFeaturedHorse } from "../hooks";
import silverStreak from "@/assets/silver-streak.png";

/** Human-readable form of a CHARACTERISTIC_TAG enum value, e.g. "EARLY_SPRINTER" → "Early Sprinter". */
function formatTag(tag) {
  return tag
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function VirtualPaddock() {
  const { data: horse, isLoading } = useFeaturedHorse();

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

        {isLoading ? (
          <Skeleton className="mx-auto mt-12 h-72 max-w-5xl rounded-2xl" />
        ) : !horse ? (
          <div className="mx-auto mt-12 max-w-5xl">
            <EmptyState
              title="No ranked horse yet"
              description="Check back once a race has been settled."
            />
          </div>
        ) : (
          <Card className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl">
            <div className="grid md:grid-cols-2">
              {/* LEFT — horse photo (stock art; no per-horse photo on this public endpoint) */}
              <div className="relative min-h-72">
                <img
                  src={silverStreak}
                  alt={horse.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent p-6">
                  <p className="text-sm text-white/70">
                    {horse.grade ?? "Unranked"}
                  </p>
                  <p className="text-2xl font-bold uppercase text-white">
                    {horse.name}
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {horse.wins} Wins · {horse.starts} Races · {horse.winRate}
                    % Win
                  </p>
                </div>
              </div>

              {/* RIGHT — real characteristic tags */}
              <div className="bg-brand-800 p-8 text-white">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand-50/90" />
                  <h3 className="text-lg font-semibold">Characteristics</h3>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {horse.characteristics.length ? (
                    horse.characteristics.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
                      >
                        {formatTag(tag)}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">
                      No characteristics recorded yet.
                    </p>
                  )}
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
        )}
      </div>
    </section>
  );
}
