import { Search } from "lucide-react";
function SearchFilterBar({ value, onChange, placeholder = "T\xECm ki\u1EBFm\u2026", children }) {
  return <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-56">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
  />
      </div>
      {children}
    </div>;
}
export {
  SearchFilterBar
};
