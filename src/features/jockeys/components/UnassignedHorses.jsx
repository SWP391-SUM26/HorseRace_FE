import { Check } from "lucide-react";
import { Avatar, Badge, Card, CardBody } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";

export function UnassignedHorses({ entries, selectedId, onSelect }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Unassigned Horses</h2>
          <Badge tone="warning">{entries.length} Pending</Badge>
        </div>
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => {
            const selected = entry.id === selectedId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    selected
                      ? "border-brand-700 bg-brand-50 ring-2 ring-brand-500"
                      : "border-border hover:bg-subtle",
                  )}
                >
                  <Avatar name={entry.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {entry.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {entry.race} · {formatDate(entry.date)}
                    </p>
                  </div>
                  {selected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
