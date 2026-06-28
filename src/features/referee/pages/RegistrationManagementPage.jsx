import { useState } from "react";
import { Check, X } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Avatar,
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
  Textarea
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { downloadCsv } from "@/common/lib/csv";
import {
  useApproveRegistration,
  useHorseVerification,
  useRegistrations,
  useRegistrationStats,
  useRejectRegistration
} from "../hooks";
import { REGISTRATION_STATUS_FILTERS } from "../constants";
const STATUS_TONE = {
  APPROVED: "success",
  REJECTED: "danger",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  DRAFT: "neutral",
  WITHDRAWN: "neutral"
};
const REVIEWABLE = ["SUBMITTED", "UNDER_REVIEW"];
function RegistrationManagementPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const statsQuery = useRegistrationStats();
  const listQuery = useRegistrations({ q: q || void 0, status: status || void 0, page });
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const stats = statsQuery.data;
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  function exportRegistrations() {
    if (rows.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(
      "registrations.csv",
      [
        { label: "Code", value: (r) => r.registrationCode },
        { label: "Horse", value: (r) => r.horseName ?? "" },
        { label: "Owner", value: (r) => r.ownerName ?? "" },
        { label: "Tournament", value: (r) => r.tournamentName ?? "" },
        { label: "Category", value: (r) => r.category ?? "" },
        { label: "Status", value: (r) => r.status },
        { label: "Submitted", value: (r) => r.submittedAt ?? "" },
        { label: "Reviewed", value: (r) => r.reviewedAt ?? "" }
      ],
      rows
    );
    toast.success(`Exported ${rows.length} registration${rows.length === 1 ? "" : "s"} (current view)`);
  }
  function handleApprove(id) {
    approve.mutate(id, {
      onSuccess: () => toast.success("Registration approved"),
      onError: (err) => toast.error(errorMessage(err))
    });
  }
  function handleReject() {
    if (!selected || !reason.trim()) return;
    reject.mutate(
      { id: selected.registrationId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Registration rejected");
          setRejectOpen(false);
          setReason("");
        },
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  }
  return <>
      <PageHeader
    title="Registration Management"
    subtitle="Review horse eligibility and approve registrations for upcoming races."
    actions={<div className="flex items-center gap-2">
            <Button
      variant="secondary"
      onClick={() => {
        listQuery.refetch();
        statsQuery.refetch();
        toast.success("Registrations refreshed");
      }}
    >
              Refresh Data
            </Button>
            <Button variant="secondary" onClick={exportRegistrations}>
              Export Registrations
            </Button>
          </div>}
  />

      {
    /* KPI row */
  }
      <div className="grid gap-4 sm:grid-cols-4">
        {statsQuery.isPending || !stats ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />) : <>
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Pending Approval" value={stats.pending} hint="Awaiting review" />
            <StatCard label="Approved" value={stats.approved} />
            <StatCard label="Rejected" value={stats.rejected} />
          </>}
      </div>

      {
    /* Filters */
  }
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Input
    label="Search"
    placeholder="ID, horse, or owner…"
    value={q}
    onChange={(e) => {
      setQ(e.target.value);
      setPage(0);
    }}
  />
        </div>
        <div className="w-48">
          <Select
    label="Status"
    options={REGISTRATION_STATUS_FILTERS}
    value={status}
    onChange={(e) => {
      setStatus(e.target.value);
      setPage(0);
    }}
  />
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {
    /* LEFT — list */
  }
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-0">
              {listQuery.isPending ? <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div> : listQuery.isError ? <EmptyState title="Could not load registrations" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No registrations" /> : <ul className="divide-y divide-border">
                  {rows.map((r) => {
    const active = selected?.registrationId === r.registrationId;
    return <li key={r.registrationId}>
                        <button
      type="button"
      onClick={() => setSelected(r)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        active ? "bg-brand-50" : "hover:bg-subtle/60"
      )}
    >
                          <Avatar name={r.horseName ?? "?"} size={40} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-ink">
                                {r.horseName ?? "\u2014"}
                              </span>
                              <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                            </div>
                            <p className="truncate text-xs text-muted">
                              {r.registrationCode} · {r.ownerName ?? "\u2014"} · {r.tournamentName ?? "\u2014"}
                            </p>
                          </div>
                        </button>
                      </li>;
  })}
                </ul>}
            </CardBody>
          </Card>

          {totalPages > 1 && <div className="mt-3 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
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
            </div>}
        </div>

        {
    /* RIGHT — horse verification */
  }
        <aside>
          <VerificationPanel
    registration={selected}
    approving={approve.isPending}
    onApprove={() => selected && handleApprove(selected.registrationId)}
    onReject={() => setRejectOpen(true)}
  />
        </aside>
      </div>

      <Modal
    open={rejectOpen}
    onClose={() => setRejectOpen(false)}
    title="Reject registration"
    footer={<>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={reject.isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={reject.isPending} disabled={!reason.trim()}>
              Confirm reject
            </Button>
          </>}
  >
        <Textarea
    label="Reason"
    rows={4}
    placeholder="Why is this registration being rejected?"
    value={reason}
    onChange={(e) => setReason(e.target.value)}
  />
      </Modal>
    </>;
}
function VerificationPanel({
  registration,
  approving,
  onApprove,
  onReject
}) {
  const verify = useHorseVerification(registration?.horseId ?? null);
  const reviewable = registration ? REVIEWABLE.includes(registration.status) : false;
  const [notes, setNotes] = useState("");
  return <Card>
      <CardBody className="flex flex-col gap-5">
        <h2 className="font-semibold text-ink">Horse Verification</h2>

        {!registration ? <p className="text-sm text-muted">Select a registration to verify.</p> : verify.isPending ? <Skeleton className="h-72 w-full rounded-xl" /> : verify.isError || !verify.data ? <p className="text-sm text-muted">Could not load horse details.</p> : <>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-subtle/40 p-3">
              <Avatar name={verify.data.name} size={48} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{verify.data.name}</p>
                <p className="text-xs text-muted">#{verify.data.microchipNo ?? registration.horseCode ?? "\u2014"}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {verify.data.ageYears != null ? `${verify.data.ageYears} Yrs` : "\u2014"} · {verify.data.genderWord}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Identity & Lineage</p>
              <dl className="mt-2 flex flex-col gap-1.5 text-sm">
                <Row label="Breed" value={verify.data.breed ?? "\u2014"} />
                <Row label="Sire" value={verify.data.sireName ?? "\u2014"} />
                <Row label="Dam" value={verify.data.damName ?? "\u2014"} />
              </dl>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Eligibility Check</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                <Eligibility label="Vaccination Records" ok={verify.data.vaccinationsUpToDate === true} />
                <Eligibility label="Fitness Certification" ok={verify.data.fitnessCertified === true} />
                <Eligibility label="Passport Scan" ok={verify.data.passportScanStatus === "VALID"} />
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Referee Notes</p>
              <Textarea
    rows={3}
    className="mt-2"
    placeholder="Add regulatory notes or observations…"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
            </div>

            <div className="flex gap-2 border-t border-border pt-4">
              <Button
    className="flex-1"
    leftIcon={<Check size={16} />}
    loading={approving}
    disabled={!reviewable}
    onClick={onApprove}
  >
                Approve
              </Button>
              <Button
    variant="danger"
    className="flex-1"
    leftIcon={<X size={16} />}
    disabled={!reviewable}
    onClick={onReject}
  >
                Reject
              </Button>
            </div>
            {!reviewable && <p className="text-xs text-muted">
                This registration is {registration.status.toLowerCase()} — no action available.
              </p>}
          </>}
      </CardBody>
    </Card>;
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>;
}
function Eligibility({ label, ok, note }) {
  return <li className="flex items-center justify-between gap-3">
      <span className="text-ink">{label}</span>
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", ok ? "text-success" : "text-danger")}>
        {ok ? <Check size={14} /> : <X size={14} />}
        {note ?? (ok ? "VALID" : "MISSING")}
      </span>
    </li>;
}
function errorMessage(err) {
  if (isAxiosError(err)) {
    const s = err.response?.status;
    if (s === 409) return "This registration was already reviewed.";
    if (s === 400) return "This registration cannot be reviewed in its current state.";
    if (s === 403) return "You are not authorized to review registrations.";
  }
  return "Something went wrong. Please try again.";
}
export {
  RegistrationManagementPage as default
};
