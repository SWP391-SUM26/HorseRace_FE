import { Card, CardHeader, CardBody, DataTable } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { usd } from "../format";

const columns = [
  {
    key: "race",
    header: "Race",
    render: (r) => (
      <div>
        <p className="font-medium text-ink">{r.raceName ?? r.raceCode}</p>
        <p className="text-xs text-muted">
          {r.tournamentName ?? "—"}
          {r.scheduledStartAt ? ` · ${formatDate(r.scheduledStartAt)}` : ""}
        </p>
      </div>
    ),
  },
  { key: "horse", header: "Horse", render: (r) => r.horseName },
  { key: "jockey", header: "Jockey", render: (r) => r.jockeyName },
  {
    key: "prizeWon",
    header: "Prize Won",
    className: "text-right",
    render: (r) => <span className="font-medium text-success">{usd(r.prizeWon)}</span>,
  },
  {
    key: "jockeyPaid",
    header: "Jockey Paid",
    className: "text-right",
    render: (r) => <span className="font-medium text-danger">{usd(r.jockeyPaid)}</span>,
  },
];

/** Per-race breakdown: real prize money won vs. the jockey hire fee actually paid for it. */
export function RaceEarningsTable({ rows, loading }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Race Earnings</h2>
      </CardHeader>
      <CardBody>
        <DataTable
          rows={rows ?? []}
          columns={columns}
          rowKey={(r) => r.raceId}
          loading={loading}
          emptyLabel="No settled races yet"
        />
      </CardBody>
    </Card>
  );
}
