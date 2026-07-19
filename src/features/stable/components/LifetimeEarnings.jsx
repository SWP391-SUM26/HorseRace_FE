import { usd } from "../format";

export function LifetimeEarnings({ lifetimeEarnings, starts, wins, top3 }) {
  const stats = [
    { label: "Starts", value: starts },
    { label: "Wins", value: wins },
    { label: "Top 3", value: top3 },
  ];
  return (
    <div className="rounded-2xl border border-brand-700 bg-brand-800 p-6 text-white shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-white/70">
        Lifetime Earnings
      </p>
      <p className="mt-2 text-3xl font-bold">{usd(lifetimeEarnings)}</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-brand-700 pt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-white/70">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
