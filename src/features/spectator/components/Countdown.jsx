import { useEffect, useState } from "react";
function diff(target) {
  if (!target) return { h: 0, m: 0, s: 0, done: true };
  const ms = new Date(target).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return { h: 0, m: 0, s: 0, done: true };
  const total = Math.floor(ms / 1e3);
  return { h: Math.floor(total / 3600), m: Math.floor(total % 3600 / 60), s: total % 60, done: false };
}
const pad = (n) => String(n).padStart(2, "0");
function Countdown({ target, variant = "boxes" }) {
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1e3);
    return () => clearInterval(id);
  }, [target]);
  if (variant === "inline") {
    return <span className="tabular-nums font-semibold text-ink">
        {t.done ? "Started" : `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`}
      </span>;
  }
  const boxes = [
    { label: "HOURS", value: t.h },
    { label: "MINS", value: t.m },
    { label: "SECS", value: t.s }
  ];
  return <div className="flex gap-3">
      {boxes.map((b) => <div key={b.label} className="min-w-[64px] rounded-xl bg-slate-800 px-3 py-2 text-center">
          <div className="text-2xl font-bold tabular-nums text-white">{pad(t.done ? 0 : b.value)}</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{b.label}</div>
        </div>)}
    </div>;
}
export {
  Countdown
};
