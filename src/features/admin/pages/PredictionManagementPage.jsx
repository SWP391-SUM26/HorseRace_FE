import { useState } from "react";
import { Ban } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  StatCard,
} from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useAdminPredictions,
  usePredictionStats,
  useVoidPrediction,
} from "../hooks";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "VOID", label: "Void" },
  { value: "REFUNDED", label: "Refunded" },
];
const TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "WIN", label: "Win" },
  { value: "PLACE", label: "Place" },
  { value: "SHOW", label: "Show" },
];

const TONE = {
  PENDING: "warning",
  WON: "success",
  LOST: "neutral",
  VOID: "danger",
  REFUNDED: "info",
};

const money = (v) =>
  v == null ? "—" : `${Math.round(v).toLocaleString("vi-VN")}₫`;
const when = (iso) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function PredictionManagementPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(0);
  const [voiding, setVoiding] = useState(null);
  const [reason, setReason] = useState("");

  const statsQuery = usePredictionStats();
  const listQuery = useAdminPredictions({
    q: q || undefined,
    status: status || undefined,
    predictionType: type || undefined,
    page,
  });
  const voidMutation = useVoidPrediction();
  const toast = useToast();

  const stats = statsQuery.data;
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;

  // Only an unsettled bet can be voided — a settled one has already moved money
  // and needs a resettle, not a void. Mirrors the guard the backend enforces.
  const canVoid = (p) => p.status === "PENDING" || p.status === "CONFIRMED";

  const submitVoid = () => {
    if (!voiding) return;
    voidMutation.mutate(
      { id: voiding.predictionId, reason },
      {
        onSuccess: () => {
          toast.success("Prediction voided — stake refunded to the bettor.");
          setVoiding(null);
          setReason("");
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Prediction Management"
        subtitle="Every bet placed on the platform — search, review and void."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard label="Total bets" value={stats?.total ?? "—"} />
            <StatCard
              label="Pending"
              value={stats?.pending ?? "—"}
              hint="Not settled yet"
            />
            <StatCard
              label="Total staked"
              value={stats ? money(stats.totalStake) : "—"}
            />
            <StatCard
              label="Paid out"
              value={stats ? money(stats.totalPaidOut) : "—"}
            />
          </>
        )}
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full flex-1 sm:min-w-56">
          <Input
            label="Search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Bettor name, email, or race…"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={STATUS_FILTERS}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            label="Bet type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
            options={TYPE_FILTERS}
          />
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {listQuery.isPending ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <EmptyState
              title="Couldn't load predictions"
              description="Please try again."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No predictions found"
              description="Adjust the filters above."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Bettor</th>
                    <th className="px-4 py-3">Race</th>
                    <th className="px-4 py-3">Bet</th>
                    <th className="px-4 py-3 text-right">Stake</th>
                    <th className="px-4 py-3 text-right">Payout</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Placed</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.predictionId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {p.spectatorName ?? "—"}
                        </p>
                        <p className="text-xs text-muted">
                          {p.spectatorEmail ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{p.raceName ?? "—"}</p>
                        <p className="text-xs text-muted">{p.raceCode ?? ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{p.predictionType ?? "—"}</p>
                        <p className="text-xs text-muted">
                          {p.horseName ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {money(p.stakeAmount)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {money(p.payoutAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={TONE[p.status ?? ""] ?? "neutral"}>
                          {p.status ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {when(p.submittedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canVoid(p) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Ban size={14} />}
                            onClick={() => {
                              setVoiding(p);
                              setReason("");
                            }}
                          >
                            Void
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-muted">
            Page {page + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        open={!!voiding}
        onClose={() => setVoiding(null)}
        title="Void this prediction?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setVoiding(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={voidMutation.isPending}
              onClick={submitVoid}
            >
              Void &amp; refund
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-muted">
          The stake of {money(voiding?.stakeAmount ?? null)} will be refunded
          to{" "}
          <span className="font-medium text-ink">
            {voiding?.spectatorName ?? "the bettor"}
          </span>{" "}
          and they will be notified. This cannot be undone.
        </p>
        <Input
          label="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. duplicate bet from a client retry"
        />
      </Modal>
    </div>
  );
}
