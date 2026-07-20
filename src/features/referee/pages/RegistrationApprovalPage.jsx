import { useEffect, useState } from "react";
import { Check, Download, FileClock, X } from "lucide-react";
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
  Textarea,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { apiClient } from "@/common/lib/apiClient";
import { env } from "@/common/config/env";
import { formatDate } from "@/common/lib/format";
import {
  useApplication,
  useApplications,
  useApplicationStats,
  useApproveApplication,
  useRejectApplication,
  useRequestApplicationInfo,
} from "../hooks";
import {
  APPLICATION_STATUS_FILTERS,
  APPLICATION_STATUS_TONE,
  REQUESTED_ROLE_FILTERS,
} from "../constants";

const ROLE_LABEL = {
  OWNER: "Owner",
  TRAINER: "Trainer",
  VET: "Vet",
  JOCKEY: "Jockey",
};

/** ISO → "N hours ago" (coarse, UTC-safe). */
function timeAgo(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** A verification status counts as "passed" for the checklist icon. */
function okStatus(s) {
  return ["VALID", "ACTIVE", "PASSED", "VERIFIED"].includes(
    (s ?? "").toUpperCase(),
  );
}

const REVIEWABLE = ["PENDING", "UNDER_REVIEW", "INFO_REQUESTED"];

export default function RegistrationApprovalPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const statsQuery = useApplicationStats();
  const listQuery = useApplications({
    q: q || undefined,
    status: status || undefined,
    requestedRole: role || undefined,
  });

  const stats = statsQuery.data;
  const rows = listQuery.data?.rows ?? [];

  // Default-select the first applicant once the queue loads.
  useEffect(() => {
    if (!selectedId && rows.length > 0) setSelectedId(rows[0].applicationId);
  }, [rows, selectedId]);

  const selected = rows.find((r) => r.applicationId === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Registration Approval"
        subtitle="Review applicant dossiers and onboard new participants."
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsQuery.isPending ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Pending Approvals"
              value={stats?.pendingApprovals ?? "—"}
            />
            <StatCard
              label="Approved Today"
              value={stats?.approvedToday ?? "—"}
            />
            <StatCard
              label="Rejected Today"
              value={stats?.rejectedToday ?? "—"}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={APPLICATION_STATUS_FILTERS}
          />
        </div>
        <div className="w-40">
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={REQUESTED_ROLE_FILTERS}
          />
        </div>
        <div className="min-w-56 flex-1">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applicant name…"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — queue */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h2 className="font-semibold text-ink">
                Queue {rows.length ? `(${rows.length})` : ""}
              </h2>
              {listQuery.isPending ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))}
                </div>
              ) : listQuery.isError ? (
                <EmptyState
                  title="Couldn't load the queue"
                  description="The onboarding service is not available yet."
                />
              ) : rows.length === 0 ? (
                <EmptyState
                  title="No applications"
                  description="There are no applicants in the queue."
                />
              ) : (
                <ul className="flex flex-col gap-2">
                  {rows.map((row) => (
                    <QueueCard
                      key={row.applicationId}
                      row={row}
                      active={selected?.applicationId === row.applicationId}
                      onSelect={() => setSelectedId(row.applicationId)}
                    />
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT — dossier */}
        <div className="lg:col-span-2">
          {selected ? (
            <DossierPanel
              key={selected.applicationId}
              applicationId={selected.applicationId}
              onViewPrevious={(name) => setQ(name)}
            />
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-muted">
                  Select an applicant to review their dossier.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function QueueCard({ row, active, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-xl border p-3 text-left transition-colors",
          active
            ? "border-brand-700 bg-brand-50"
            : "border-border hover:bg-subtle/60",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {row.fullName}
            </p>
            <p className="truncate text-xs text-muted">
              {ROLE_LABEL[row.requestedRole] ?? row.requestedRole} • Register
            </p>
            <p className="text-xs text-muted">ID: {row.applicationCode}</p>
          </div>
          {row.priority === "URGENT" ? (
            <Badge tone="danger">Urgent</Badge>
          ) : row.status === "PENDING" ? (
            <Badge tone="info">New</Badge>
          ) : (
            <Badge tone={APPLICATION_STATUS_TONE[row.status]}>
              {row.status.replace("_", " ")}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">
          Submitted {timeAgo(row.submittedAt)}
        </p>
      </button>
    </li>
  );
}

function DossierPanel({ applicationId, onViewPrevious }) {
  const toast = useToast();
  const { data, isPending, isError } = useApplication(applicationId);
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const requestInfo = useRequestApplicationInfo();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  if (isPending)
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-96 w-full rounded-xl" />
        </CardBody>
      </Card>
    );
  if (isError || !data) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            title="Couldn't load the dossier"
            description="The onboarding service is not available yet."
          />
        </CardBody>
      </Card>
    );
  }

  const reviewable = REVIEWABLE.includes(data.status);

  function handleApprove() {
    approve.mutate(applicationId, {
      onSuccess: () => toast.success("Applicant approved & onboarded"),
    });
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={data.fullName}
              src={data.avatarUrl ?? undefined}
              size={56}
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">
                {data.fullName}
              </h2>
              <p className="text-xs text-muted">
                {data.location ?? "—"}
                {data.memberSince ? ` • Member since ${data.memberSince}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge tone="neutral">
                  {ROLE_LABEL[data.requestedRole] ?? data.requestedRole}
                </Badge>
                {data.eligibility?.license?.class && (
                  <Badge tone="info">
                    {data.eligibility.license.class} License
                  </Badge>
                )}
                <Badge tone={APPLICATION_STATUS_TONE[data.status]}>
                  {data.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-sm">
            <a
              href={`${env.apiBaseUrl}/referee/applications/${data.applicationId}/dossier`}
              className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800"
            >
              <Download size={15} /> Download Full Dossier
            </a>
            <button
              type="button"
              onClick={() => onViewPrevious(data.fullName)}
              className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800"
            >
              <FileClock size={15} /> View Previous Applications
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* identity + business */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Identity Details
              </p>
              <dl className="mt-2 flex flex-col gap-1.5 text-sm">
                <Row label="Full Name" value={data.fullName} />
                <Row
                  label="Date of Birth"
                  value={data.dateOfBirth ? formatDate(data.dateOfBirth) : "—"}
                />
                <Row label="Tax ID" value={data.taxIdMasked ?? "—"} />
                <Row label="Contact" value={data.phone ?? "—"} />
              </dl>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Business Affiliations
              </p>
              {data.businessAffiliation?.orgName ? (
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-subtle/40 p-3">
                  <Avatar name={data.businessAffiliation.orgName} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {data.businessAffiliation.orgName}
                    </p>
                    <p className="text-xs text-muted">
                      {data.businessAffiliation.horsesRegistered ?? 0} Horses
                      Registered
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  No affiliations on file.
                </p>
              )}
            </div>
          </div>

          {/* eligibility checklist */}
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold text-ink">Eligibility Checklist</p>
            <p className="mt-1 text-xs text-muted">
              All automated checks must be manually verified before approval.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              <CheckRow
                title="ID Verification"
                detail={data.eligibility?.idVerification?.documentRef ?? "—"}
                ok={okStatus(data.eligibility?.idVerification?.status)}
              />

              <CheckRow
                title="License Check"
                detail={
                  [
                    data.eligibility?.license?.class,
                    data.eligibility?.license?.status,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"
                }
                ok={okStatus(data.eligibility?.license?.status)}
              />

              <CheckRow
                title="Background Check"
                detail={data.eligibility?.backgroundCheck?.status ?? "—"}
                ok={okStatus(data.eligibility?.backgroundCheck?.status)}
              />
            </ul>
          </div>

          {/* jockey documents (auth-gated download) */}
          {data.requestedRole === "JOCKEY" &&
            (data.jockeyLicenseUrl || data.jockeyFitnessCertificateUrl) && (
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold text-ink">Documents</p>
                <p className="mt-1 text-xs text-muted">
                  Submitted licence &amp; fitness certificate — open to verify
                  before approval.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.jockeyLicenseUrl && (
                    <DocButton
                      label="Jockey License"
                      path={data.jockeyLicenseUrl}
                    />
                  )}
                  {data.jockeyFitnessCertificateUrl && (
                    <DocButton
                      label="Fitness Certificate"
                      path={data.jockeyFitnessCertificateUrl}
                    />
                  )}
                </div>
              </div>
            )}
        </div>

        {data.status === "REJECTED" && data.rejectionReason && (
          <p className="rounded-xl border border-border bg-subtle/40 p-3 text-sm text-ink">
            <span className="font-medium">Rejection reason:</span>{" "}
            {data.rejectionReason}
          </p>
        )}

        {/* footer actions */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="secondary"
            disabled={!reviewable}
            onClick={() => setInfoOpen(true)}
          >
            Request More Info
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={!reviewable}
            onClick={() => setRejectOpen(true)}
          >
            Reject Applicant
          </Button>
          <Button
            className="flex-1"
            loading={approve.isPending}
            disabled={!reviewable}
            onClick={handleApprove}
          >
            Approve &amp; Onboard
          </Button>
        </div>
        {!reviewable && (
          <p className="text-xs text-muted">
            This application is {data.status.toLowerCase().replace("_", " ")} —
            no action available.
          </p>
        )}
      </CardBody>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        loading={reject.isPending}
        onSubmit={(reason) =>
          reject.mutate(
            { id: applicationId, reason },
            {
              onSuccess: () => {
                toast.success("Applicant rejected");
                setRejectOpen(false);
              },
            },
          )
        }
      />

      <RequestInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        loading={requestInfo.isPending}
        onSubmit={(note) =>
          requestInfo.mutate(
            { id: applicationId, note },
            {
              onSuccess: () => {
                toast.success("Information requested");
                setInfoOpen(false);
              },
            },
          )
        }
      />
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function CheckRow({ title, detail, ok }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border p-2.5">
      <span
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          ok ? "bg-success/15 text-success" : "bg-subtle text-muted",
        )}
      >
        {ok ? <Check size={14} /> : <X size={14} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="truncate text-xs text-muted">{detail}</p>
      </div>
    </li>
  );
}

/**
 * Opens a sensitive jockey document. The path is auth-gated ({@code /api/v1/attachments/{id}/download}),
 * so we fetch it through apiClient (which attaches the Bearer token) as a blob and open the object URL —
 * a plain <a href> would not carry the token.
 */
function DocButton({ label, path }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(path.replace(/^\/api\/v1/, ""), {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Không mở được tài liệu");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={open}
      loading={loading}
      leftIcon={<Download size={15} />}
    >
      {label}
    </Button>
  );
}

function RejectModal({ open, onClose, loading, onSubmit }) {
  const [reason, setReason] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject Applicant"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            disabled={!reason.trim()}
            onClick={() => onSubmit(reason.trim())}
          >
            Reject
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason"
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain why this application is rejected…"
      />
    </Modal>
  );
}

function RequestInfoModal({ open, onClose, loading, onSubmit }) {
  const [note, setNote] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request More Info"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={!note.trim()}
            onClick={() => onSubmit(note.trim())}
          >
            Send request
          </Button>
        </>
      }
    >
      <Textarea
        label="What do you need from the applicant?"
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Upload a clearer copy of the license…"
      />
    </Modal>
  );
}
