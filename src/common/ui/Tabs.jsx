import { cn } from "@/common/lib/cn";
function Tabs({ tabs, active, onChange }) {
  return <div className="flex gap-1 border-b border-border">
      {tabs.map((t) => <button
    key={t.key}
    onClick={() => onChange(t.key)}
    className={cn(
      "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
      active === t.key ? "border-brand-700 text-brand-700" : "border-transparent text-muted hover:text-ink"
    )}
  >
          {t.label}
        </button>)}
    </div>;
}
export {
  Tabs
};
