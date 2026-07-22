import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  DataTable,
  Pagination,
} from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { cn } from "@/common/lib/cn";
import { usd } from "../format";

const columns = [
  { key: "date", header: "Date", render: (t) => formatDate(t.date) },
  {
    key: "description",
    header: "Description",
    render: (t) => <span className="font-medium text-ink">{t.description}</span>,
  },
  { key: "horse", header: "Horse", render: (t) => t.horse },
  {
    key: "category",
    header: "Category",
    render: (t) => (
      <Badge tone={t.category === "INCOME" ? "success" : "danger"}>
        {t.category}
      </Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    className: "text-right",
    render: (t) => (
      <span
        className={cn(
          "font-medium",
          t.category === "INCOME" ? "text-success" : "text-danger",
        )}
      >
        {t.category === "INCOME" ? "+" : "-"}
        {usd(t.amount)}
      </span>
    ),
  },
];

const PAGE_SIZE = 6;

export function RecentTransactionsCard({ transactions, total }) {
  const [page, setPage] = useState(0);
  // `totalPages` was hardcoded to 2 and `page` drove nothing, so the paginator
  // was decorative and the table always rendered every fetched row. Paginate
  // over what we actually have.
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visible = transactions.slice(start, start + PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Recent Transactions</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <DataTable
          rows={visible}
          columns={columns}
          rowKey={(t) => t.id}
          emptyLabel="No transactions yet"
        />
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Showing {transactions.length === 0 ? 0 : start + 1}-
            {start + visible.length} of {total} transactions
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </CardBody>
    </Card>
  );
}
