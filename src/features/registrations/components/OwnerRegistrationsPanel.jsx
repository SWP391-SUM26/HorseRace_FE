import { useMemo, useState } from "react";
import { Badge, Button, EmptyState, Skeleton } from "@/common/ui";
import { Calendar, Flag, Hash, MapPin } from "lucide-react";
import { formatDate } from "@/common/lib/format";
import { useToast } from "@/common/providers/ToastProvider";
import { useAuth } from "@/common/hooks/useAuth";
import { useMyRegistrations, useWithdrawRegistration } from "../hooks";
import { canWithdraw } from "../api";
const PAGE_SIZE = 4;
const TONE = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
  REMOVED: "neutral"
};
const STATUS_LABEL = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  REMOVED: "Removed"
};
function OwnerRegistrationsPanel() {
  const { user } = useAuth();
  const { data, isPending, isError } = useMyRegistrations(user?.id ?? "");
  const withdraw = useWithdrawRegistration();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const rows = useMemo(() => data ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages - 1);
  const paged = rows.slice(pageClamped * PAGE_SIZE, pageClamped * PAGE_SIZE + PAGE_SIZE);
  if (isPending) {
    return <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
      </div>;
  }
  if (isError) return <EmptyState title="Couldn't load registrations" description="Please try again." />;
  if (rows.length === 0) {
    return <EmptyState title="No registrations yet" description="Register a horse from the Catalog tab to track its approval status here." />;
  }
  return <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {paged.map((reg) => <RegistrationCard
    key={reg.id}
    reg={reg}
    withdrawing={withdraw.isPending}
    onWithdraw={() => withdraw.mutate(reg.id, {
      onSuccess: () => toast.success("Registration withdrawn")
    })}
  />)}
      </div>

      {totalPages > 1 && <div className="flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => <Button key={i} size="sm" variant={pageClamped === i ? "primary" : "ghost"} onClick={() => setPage(i)}>{i + 1}</Button>)}
        </div>}
    </div>;
}
function RegistrationCard({ reg, withdrawing, onWithdraw }) {
  return <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted">{reg.code}</p>
          <h3 className="truncate font-semibold text-ink">{reg.tournament}</h3>
        </div>
        <Badge tone={TONE[reg.status]}>{STATUS_LABEL[reg.status]}</Badge>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <Row icon={<Hash className="h-3.5 w-3.5" />} label="Horse" value={`${reg.horse} \xB7 #${reg.horseCode}`} />
        <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Race" value={reg.race ?? "\u2014"} />
        <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Submitted" value={reg.submittedAt ? formatDate(reg.submittedAt) : "\u2014"} />
      </div>

      {reg.status === "REJECTED" && <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2">
          <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
          <div>
            <p className="text-xs font-medium text-danger">Rejection reason</p>
            <p className="text-sm text-ink">{reg.rejectionReason || "No reason provided."}</p>
          </div>
        </div>}

      {canWithdraw(reg.status) && <div className="flex justify-end">
          <Button size="sm" variant="secondary" loading={withdrawing} onClick={onWithdraw}>Withdraw</Button>
        </div>}
    </div>;
}
function Row({ icon, label, value }) {
  return <div className="flex items-center gap-2">
      <span className="text-muted">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto truncate font-medium text-ink">{value}</span>
    </div>;
}
export {
  OwnerRegistrationsPanel
};
