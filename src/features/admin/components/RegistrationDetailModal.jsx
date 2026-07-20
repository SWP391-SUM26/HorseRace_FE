import { useState } from "react";
import { Check, Trophy, X } from "lucide-react";
import { Avatar, Badge, Button, Modal, Skeleton, Textarea } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import { useApproveRegistration, useHorse, useRejectRegistration, useTournament, useUser } from "../hooks";
import { REGISTRATION_STATUS_TONE, TOURNAMENT_STATUS_TONE } from "../constants";
const REVIEWABLE = ["SUBMITTED", "UNDER_REVIEW"];
function Field({ label, value }) {
  return <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "\u2014"}</p>
    </div>;
}
function RegistrationDetailModal({ registration, onClose }) {
  const toast = useToast();
  const horseQuery = useHorse(registration.horseId);
  const ownerQuery = useUser(registration.ownerUserId);
  const tournamentQuery = useTournament(registration.tournamentId);
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const horse = horseQuery.data;
  const owner = ownerQuery.data;
  const tournament = tournamentQuery.data;
  const reviewable = REVIEWABLE.includes(registration.status);
  function onApprove() {
    approve.mutate(registration.registrationId, {
      onSuccess: () => {
        toast.success("Registration approved");
        onClose();
      }
    });
  }
  function onReject() {
    if (!reason.trim()) return toast.error("Enter a reason");
    reject.mutate(
      { id: registration.registrationId, reason: reason.trim() },
      { onSuccess: () => {
        toast.success("Registration rejected");
        onClose();
      } }
    );
  }
  return <Modal
    open
    onClose={onClose}
    size="lg"
    title={`Registration ${registration.registrationCode}`}
    footer={reviewable ? rejecting ? <>
              <Button variant="secondary" onClick={() => setRejecting(false)} disabled={reject.isPending}>Back</Button>
              <Button variant="danger" loading={reject.isPending} disabled={!reason.trim()} onClick={onReject}>Confirm Reject</Button>
            </> : <>
              <Button variant="ghost" className="mr-auto border border-danger text-danger hover:bg-danger/10" onClick={() => setRejecting(true)}>
                <X size={15} /> Reject
              </Button>
              <Button variant="secondary" onClick={onClose}>Close</Button>
              <Button loading={approve.isPending} onClick={onApprove}><Check size={15} /> Approve</Button>
            </> : <Button variant="secondary" onClick={onClose}>Close</Button>}
  >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={REGISTRATION_STATUS_TONE[registration.status]}>{registration.status.replace(/_/g, " ")}</Badge>
          {registration.submittedAt && <span className="text-xs text-muted">Submitted {formatDate(registration.submittedAt)}</span>}
          {registration.category && <span className="ml-auto text-xs text-muted">{registration.category}</span>}
        </div>

        {
    /* Horse + Owner */
  }
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {
    /* Horse */
  }
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="h-36 w-full bg-subtle">
              {horseQuery.isPending ? <Skeleton className="h-36 w-full" /> : horse?.imageUrl ? <img src={horse.imageUrl} alt={horse.name} className="h-36 w-full object-cover" onError={(e) => {
    e.currentTarget.style.display = "none";
  }} /> : null}
            </div>
            <div className="flex flex-col gap-3 p-3">
              <div>
                <p className="font-semibold text-ink">{horse?.name ?? registration.horseName ?? "\u2014"}</p>
                <p className="text-xs text-muted">{horse?.horseCode ?? registration.horseCode ?? ""}</p>
              </div>
              {horse && <div className="grid grid-cols-2 gap-2">
                  <Field label="Breed" value={horse.breed} />
                  <Field label="Gender" value={horse.gender} />
                  <Field label="Color" value={horse.color} />
                  <Field label="Born" value={horse.dateOfBirth ? formatDate(horse.dateOfBirth) : null} />
                  <Field label="Weight" value={horse.weight != null ? `${horse.weight} kg` : null} />
                  <Field label="Health" value={horse.healthStatus} />
                  <Field label="Origin" value={horse.originCountry} />
                  <Field label="Status" value={horse.status} />
                </div>}
            </div>
          </div>

          {
    /* Owner */
  }
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Owner</p>
            {ownerQuery.isPending ? <Skeleton className="h-20 w-full rounded-lg" /> : owner ? <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={owner.fullName} src={owner.avatarUrl ?? void 0} size={48} />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{owner.fullName}</p>
                    <Badge tone="info">{owner.roleName ?? owner.roleCode}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Field label="Email" value={owner.email} />
                  <Field label="Phone" value={owner.phone || "\u2014"} />
                </div>
              </div> : <p className="text-sm text-muted">{registration.ownerName ?? "\u2014"}</p>}
          </div>
        </div>

        {
    /* Tournament */
  }
        <div className="rounded-xl border border-border p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <Trophy size={13} /> Tournament
          </p>
          {tournamentQuery.isPending ? <Skeleton className="h-16 w-full rounded-lg" /> : tournament ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field
    label="Name"
    value={<span className="inline-flex items-center gap-2">{tournament.name}<Badge tone={TOURNAMENT_STATUS_TONE[tournament.status]}>{tournament.status.replace(/_/g, " ")}</Badge></span>}
  />
              <Field label="Location" value={tournament.location} />
              <Field label="Dates" value={`${tournament.startDate ? formatDate(tournament.startDate) : "\u2014"} \u2192 ${tournament.endDate ? formatDate(tournament.endDate) : "\u2014"}`} />
              <Field label="Race" value={registration.raceName} />
            </div> : <p className="text-sm text-muted">{registration.tournamentName ?? "\u2014"}</p>}
        </div>

        {registration.rejectionReason && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">Rejected: {registration.rejectionReason}</p>}

        {rejecting && <Textarea label="Rejection reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why this registration is rejected…" />}
      </div>
    </Modal>;
}
export {
  RegistrationDetailModal
};
