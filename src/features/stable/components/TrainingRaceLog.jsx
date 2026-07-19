import { Card, CardHeader, CardBody, DataTable, Badge } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { Eye } from "lucide-react";
import { PositionPill } from "./PositionPill";
import { usd } from "../format";

/** ISO dates render via formatDate; pre-formatted mock strings pass through. */
function displayDate(value) {
  if (!value) return "—";
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? formatDate(value) : value;
}

const columns = [
  {
    key: "date",
    header: "Date",
    render: (r) => <span className="text-muted">{displayDate(r.date)}</span>,
  },
  {
    key: "event",
    header: "Event",
    render: (r) => (
      <div>
        <p className="font-medium text-ink">{r.event}</p>
        <Badge tone={r.type === "Race" ? "info" : "neutral"}>{r.type}</Badge>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (r) => r.location },
  {
    key: "position",
    header: "Position",
    render: (r) => <PositionPill position={r.position} />,
  },
  {
    key: "earnings",
    header: "Earnings",
    render: (r) =>
      r.earnings != null ? (
        <span className="font-medium text-ink">{usd(r.earnings)}</span>
      ) : (
        "—"
      ),
  },
  {
    key: "details",
    header: "Details",
    render: () => (
      <button
        type="button"
        className="text-muted transition-colors hover:text-brand-700"
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
    ),
  },
];

export function TrainingRaceLog({ raceHistory }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-ink">Race Log</h2>
      </CardHeader>
      <CardBody>
        <DataTable
          rows={raceHistory}
          columns={columns}
          rowKey={(r) => r.id}
          emptyLabel="No race history yet"
        />
      </CardBody>
    </Card>
  );
}
