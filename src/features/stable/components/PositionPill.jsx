import { cn } from "@/common/lib/cn";
import { ordinal } from "../format";

const STYLES = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-subtle text-muted",
  3: "bg-orange-100 text-orange-700",
};

export function PositionPill({ position }) {
  if (position == null) return <span className="text-muted">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[position] ?? "bg-subtle text-muted",
      )}
    >
      {ordinal(position)}
    </span>
  );
}
