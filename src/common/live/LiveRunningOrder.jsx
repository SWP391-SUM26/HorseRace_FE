const RANK_TONE = {
  1: "bg-warning text-white",
  2: "bg-muted text-white",
  3: "bg-brand-600 text-white"
};
function LiveRunningOrder({ runners, running }) {
  const anyRanked = runners.some((r) => r.position != null);
  const anySpeed = runners.some((r) => r.currentSpeedKph != null);
  const ordered = anyRanked ? [...runners].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)) : runners;
  return <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Live Running Order</h3>
        {running && <span className="flex items-center gap-1.5 text-xs font-medium text-danger">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
            UPDATING…
          </span>}
      </div>

      {ordered.length === 0 ? <p className="py-6 text-center text-sm text-muted">No runners on the track yet.</p> : <ul className="space-y-2">
          {ordered.map((r, i) => <li
    key={`${r.entryNo ?? "x"}-${i}`}
    className="flex items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2.5"
  >
              {anyRanked && r.position != null ? <span
    data-testid="rank-badge"
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${RANK_TONE[r.position] ?? "bg-subtle text-ink"}`}
  >
                  {r.position}
                </span> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-sm font-semibold text-ink">
                  #{r.entryNo ?? "\u2014"}
                </span>}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{r.horseName}</p>
                <p className="truncate text-xs text-muted">{r.jockeyName ?? "TBD"}</p>
              </div>
              {anySpeed && r.currentSpeedKph != null && <span data-testid="runner-speed" className="text-xs font-medium tabular-nums text-muted">
                  {r.currentSpeedKph} km/h
                </span>}
            </li>)}
        </ul>}
    </div>;
}
export {
  LiveRunningOrder
};
