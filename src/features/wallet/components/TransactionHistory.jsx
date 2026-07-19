import { Badge, Card, CardBody, DataTable, Pagination } from "@/common/ui";
import { formatMoney } from "@/common/lib/format";

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function humanizeCategory(value) {
  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TransactionHistory({ rows, loading, page, totalPages, onPageChange }) {
  const columns = [
    { key: "date", header: "Date", render: (transaction) => <span className="text-muted">{fmtTime(transaction.createdAt)}</span> },
    { key: "category", header: "Type", render: (transaction) => humanizeCategory(transaction.txnCategory) },
    {
      key: "amount",
      header: "Amount",
      className: "text-right tabular-nums",
      render: (transaction) => {
        const debit = transaction.entryType === "DEBIT";
        return (
          <span className={debit ? "font-medium text-danger" : "font-medium text-success"}>
            {debit ? "-" : "+"}{formatMoney(transaction.amount)}
          </span>
        );
      }
    },
    {
      key: "balance",
      header: "Balance After",
      className: "text-right tabular-nums text-muted",
      render: (transaction) => formatMoney(transaction.balanceAfter)
    },
    {
      key: "entry",
      header: "",
      render: (transaction) => (
        <Badge tone={transaction.entryType === "DEBIT" ? "danger" : "success"}>{transaction.entryType}</Badge>
      )
    }
  ];

  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Transaction History</h3>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(transaction) => transaction.walletTxnId}
          loading={loading}
          emptyLabel="No transactions yet"
        />
        <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
      </CardBody>
    </Card>
  );
}
