import { useState } from "react";
import { Card, CardHeader, CardBody, Badge, DataTable, Pagination } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { cn } from "@/common/lib/cn";
import { usd } from "../format";
const columns = [
  { key: "date", header: "Date", render: (t) => formatDate(t.date) },
  {
    key: "description",
    header: "Description",
    render: (t) => <span className="font-medium text-ink">{t.description}</span>
  },
  { key: "horse", header: "Horse", render: (t) => t.horse },
  {
    key: "category",
    header: "Category",
    render: (t) => <Badge tone={t.category === "INCOME" ? "success" : "danger"}>{t.category}</Badge>
  },
  {
    key: "amount",
    header: "Amount",
    className: "text-right",
    render: (t) => <span className={cn("font-medium", t.category === "INCOME" ? "text-success" : "text-danger")}>
        {t.category === "INCOME" ? "+" : "-"}
        {usd(t.amount)}
      </span>
  }
];
function RecentTransactionsCard({ transactions, total }) {
  const [page, setPage] = useState(0);
  const totalPages = 2;
  return <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">Recent Transactions</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <DataTable
    rows={transactions}
    columns={columns}
    rowKey={(t) => t.id}
    emptyLabel="No transactions yet"
  />
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Showing 1-{transactions.length} of {total} transactions
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </CardBody>
    </Card>;
}
export {
  RecentTransactionsCard
};
