import { Eye } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, DataTable } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { PositionPill } from "./PositionPill";
import { usd } from "../format";

function displayDate(value) {
  if (!value) return "—";
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? formatDate(value) : value;
}

export function TrainingRaceLog({ raceHistory }) {
  const columns = [
    { key: "date", header: "Date", render: (row) => <span className="text-muted">{displayDate(row.date)}</span> },
    {
      key: "event",
      header: "Event",
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.event}</p>
          <Badge tone={row.type === "Race" ? "info" : "neutral"}>{row.type}</Badge>
        </div>
      )
    },
    { key: "location", header: "Location", render: (row) => row.location },
    { key: "position", header: "Position", render: (row) => <PositionPill position={row.position} /> },
    {
      key: "earnings",
      header: "Earnings",
      render: (row) => (row.earnings != null ? <span className="font-medium text-ink">{usd(row.earnings)}</span> : "—")
    },
    {
      key: "details",
      header: "Details",
      render: () => (
        <button type="button" className="text-muted transition-colors hover:text-brand-700" aria-label="View details">
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-ink">Race Log</h2>
      </CardHeader>
      <CardBody>
        <DataTable
          rows={raceHistory ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          emptyLabel="No race history yet"
        />
      </CardBody>
    </Card>
  );
}
