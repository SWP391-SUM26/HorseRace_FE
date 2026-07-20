import { useState } from "react";
import { Avatar, Badge, Button, Modal, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { getApiErrorMessage } from "@/common/lib/apiError";
import { humanize } from "../api";
import { useAdminJockey, useApproveJockey, useRejectJockey } from "../hooks";
import { USER_STATUS_TONE } from "../constants";
import { DocButton } from "./DocButton";
function Field({ label, value }) {
  return <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "\u2014"}</p>
    </div>;
}
function RejectReasonModal({
  open,
  onClose,
  loading,
  onSubmit
}) {
  const [reason, setReason] = useState("");
  return <Modal
    open={open}
    onClose={onClose}
    title="Reject Jockey"
    footer={<>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>
            Confirm Reject
          </Button>
        </>}
  >
      <Textarea
    label="Reason"
    name="reason"
    rows={4}
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    placeholder="Explain why this jockey is rejected…"
  />
    </Modal>;
}
function JockeyDetailModal({ fallback, onClose }) {
  const query = useAdminJockey(fallback.userId);
  const j = query.data ?? fallback;
  const toast = useToast();
  const approve = useApproveJockey();
  const reject = useRejectJockey();
  const [rejectOpen, setRejectOpen] = useState(false);
  const isPending = j.status === "PENDING";
  const handleApprove = () => {
    approve.mutate(j.userId, {
      onSuccess: () => {
        toast.success("Jockey approved.");
        onClose();
      },
      onError: (err) => toast.error(getApiErrorMessage(err, "Could not approve the jockey."))
    });
  };
  const handleReject = (reason) => {
    reject.mutate(
      { id: j.userId, reason },
      {
        onSuccess: () => {
          toast.success("Jockey rejected.");
          setRejectOpen(false);
          onClose();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, "Could not reject the jockey."))
      }
    );
  };
  return <Modal
    open
    onClose={onClose}
    size="lg"
    title={j.fullName ?? "Jockey detail"}
    footer={isPending ? <>
            <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button>
            <Button variant="primary" loading={approve.isPending} onClick={handleApprove}>Approve</Button>
          </> : void 0}
  >
      {
    /* `fallback` (the row data) always seeds initial data, so there is no loading state to gate on. */
  }
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={j.fullName ?? "\u2014"} src={j.avatarUrl} size={48} />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink">{j.fullName ?? "\u2014"}</p>
            <p className="truncate text-xs text-muted">{j.userCode ?? "\u2014"} · {j.email ?? "\u2014"}</p>
          </div>
          {j.status && <span className="ml-auto"><Badge tone={USER_STATUS_TONE[j.status] ?? "neutral"}>{humanize(j.status)}</Badge></span>}
        </div>

        {
    /* Licence + physicals */
  }
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Licence" value={j.licenseNo} />
          <Field label="Phone" value={j.phone} />
          <Field label="Riding style" value={j.ridingStyle} />
          <Field label="Body weight" value={j.bodyWeight != null ? `${j.bodyWeight} kg` : null} />
          <Field label="Height" value={j.heightCm != null ? `${j.heightCm} cm` : null} />
          <Field label="Experience" value={j.experienceYrs != null ? `${j.experienceYrs} yr${j.experienceYrs === 1 ? "" : "s"}` : null} />
        </div>

        {
    /* Credential documents (auth-gated blob download / preview in a new tab) */
  }
        {(j.jockeyLicenseUrl || j.fitnessCertificateUrl) && <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Credential Documents</p>
            <div className="flex flex-wrap gap-2">
              {j.jockeyLicenseUrl && <DocButton label="License document" path={j.jockeyLicenseUrl} />}
              {j.fitnessCertificateUrl && <DocButton label="Fitness certificate" path={j.fitnessCertificateUrl} />}
            </div>
          </div>}

        {
    /* Career stats */
  }
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Career Stats</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Wins" value={j.winCount ?? 0} />
            <Field label="Win rate" value={j.winRate != null ? `${Math.round(j.winRate * 100)}%` : null} />
            <Field label="Rating" value={j.rating != null ? j.rating.toFixed(1) : null} />
            <Field label="Last trophy" value={j.lastTrophy} />
          </div>
          {j.recentForm && j.recentForm.length > 0 && <div className="mt-3">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">Recent form</p>
              <div className="flex flex-wrap gap-1.5">
                {j.recentForm.map((f, i) => <span
    key={i}
    className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${f === "W" ? "bg-brand-50 text-success" : "bg-subtle text-muted"}`}
  >
                    {f}
                  </span>)}
              </div>
            </div>}
        </div>

        {j.bio && <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Bio</p>
            <p className="text-sm text-ink">{j.bio}</p>
          </div>}
      </div>

      <RejectReasonModal
    open={rejectOpen}
    onClose={() => setRejectOpen(false)}
    loading={reject.isPending}
    onSubmit={handleReject}
  />
    </Modal>;
}
export {
  JockeyDetailModal
};
