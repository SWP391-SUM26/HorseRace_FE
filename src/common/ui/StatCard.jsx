import { Card } from "./Card";
function StatCard({ label, value, icon, hint }) {
  return <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {icon && <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{icon}</div>}
      </div>
    </Card>;
}
export {
  StatCard
};
