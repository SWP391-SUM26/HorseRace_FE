import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, Button, Card, CardBody, DataTable, Pagination } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useToast } from "@/common/providers/ToastProvider";
import { formatMoney } from "@/common/lib/format";
import { useApproveWithdrawal, useRejectWithdrawal, useWithdrawals } from "../hooks";
const STATUS_TONE = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "danger",
  CANCELLED: "neutral"
};
function fmtTime(iso) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function WithdrawalsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const query = useWithdrawals({ page });
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const rows = query.data?.rows ?? [];
  function onApprove(id) {
    approve.mutate(id, {
      onSuccess: () => toast.success("Withdrawal approved \u2014 funds released.")
    });
  }
  function onReject(id) {
    reject.mutate(id, {
      onSuccess: () => toast.success("Withdrawal rejected \u2014 hold returned to the wallet.")
    });
  }
  const columns = [
    {
      key: "requester",
      header: "Requester",
      render: (w) => <span className="font-medium text-ink">{w.requesterName ?? w.requesterId ?? "\u2014"}</span>
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right tabular-nums",
      render: (w) => <span className="font-medium text-ink">{formatMoney(w.amount)}</span>
    },
    { key: "requested", header: "Requested", render: (w) => <span className="text-muted">{fmtTime(w.createdAt)}</span> },
    {
      key: "status",
      header: "Status",
      render: (w) => <Badge tone={STATUS_TONE[String(w.status)] ?? "neutral"}>{String(w.status)}</Badge>
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (w) => {
        const pending = String(w.status) === "PENDING";
        if (!pending) return <span className="text-xs text-muted">—</span>;
        return <div className="flex justify-end gap-2">
            <Button
          size="sm"
          leftIcon={<Check size={14} />}
          loading={approve.isPending && approve.variables === w.id}
          onClick={() => onApprove(w.id)}
        >
              Approve
            </Button>
            <Button
          size="sm"
          variant="danger"
          leftIcon={<X size={14} />}
          loading={reject.isPending && reject.variables === w.id}
          onClick={() => onReject(w.id)}
        >
              Reject
            </Button>
          </div>;
      }
    }
  ];
  return <div className="space-y-6">
      <PageHeader title="Withdrawals" subtitle="Review and action spectator withdrawal requests." />
      <Card>
        <CardBody className="space-y-4">
          <DataTable
    rows={rows}
    columns={columns}
    rowKey={(w) => w.id}
    loading={query.isLoading}
    emptyLabel="No withdrawal requests"
  />
          <Pagination
    page={query.data?.page ?? page}
    totalPages={query.data?.totalPages ?? 1}
    onChange={setPage}
  />
        </CardBody>
      </Card>
    </div>;
}
export {
  WithdrawalsPage as default
};
