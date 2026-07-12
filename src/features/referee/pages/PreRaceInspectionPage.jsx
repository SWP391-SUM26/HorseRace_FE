import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Check, X, FileText, MapPin, Calendar, Trophy, Download } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { DocumentViewerModal, useDocumentViewer } from "@/common/components/DocumentViewerModal";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  Skeleton,
  StatCard,
  Textarea
} from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import { useToast } from "@/common/providers/ToastProvider";
import { useRegistrationAttachments } from "@/features/registrations/hooks";
import {
  useRefereeRaces,
  useRegistrations,
  useRegistrationStats,
  useHorseVerification,
  useApproveRegistration,
  useRejectRegistration
} from "../hooks";
const PENDING = ["SUBMITTED", "UNDER_REVIEW"];
function errMsg(e) {
  if (isAxiosError(e)) return e.response?.data?.message ?? "Something went wrong";
  return "Something went wrong";
}
function PreRaceInspectionPage() {
  const toast = useToast();
  const racesQ = useRefereeRaces();
  const regsQ = useRegistrations({ size: 200 });
  const statsQ = useRegistrationStats();
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const [selectedId, setSelectedId] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const viewer = useDocumentViewer();
  const assignedIds = useMemo(() => new Set((racesQ.data ?? []).map((r) => r.raceId)), [racesQ.data]);
  const queue = useMemo(
    () => (regsQ.data?.rows ?? []).filter(
      (r) => r.raceId && assignedIds.has(r.raceId) && PENDING.includes(r.status)
    ),
    [regsQ.data, assignedIds]
  );
  const selected = queue.find((r) => r.registrationId === selectedId) ?? queue[0] ?? null;
  function doApprove(id) {
    approve.mutate(id, {
      onSuccess: () => {
        toast.success("Registration approved \u2014 horse cleared to compete");
        setSelectedId(null);
      },
      onError: (e) => toast.error(errMsg(e))
    });
  }
  function doReject() {
    if (!selected || !reason.trim()) return;
    reject.mutate({ id: selected.registrationId, reason: reason.trim() }, {
      onSuccess: () => {
        toast.success("Registration rejected");
        setRejectOpen(false);
        setReason("");
        setSelectedId(null);
      },
      onError: (e) => toast.error(errMsg(e))
    });
  }
  const loading = racesQ.isPending || regsQ.isPending;
  const noAssigned = !racesQ.isPending && assignedIds.size === 0;
  return <>
      <PageHeader
    title="Pre-Race Inspection"
    subtitle="Review horse registrations for the races assigned to you, then approve or reject before they compete."
  />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending (your races)" value={loading ? "\u2014" : queue.length} />
        <StatCard label="Approved" value={statsQ.data?.approved ?? "\u2014"} />
        <StatCard label="Rejected" value={statsQ.data?.rejected ?? "\u2014"} />
      </div>

      {noAssigned ? <Card className="mt-6"><CardBody><EmptyState title="No assigned races" description="An admin hasn't assigned you to any races yet. Once assigned, the horse registrations for those races appear here." /></CardBody></Card> : <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {
    /* Queue */
  }
          <div className="lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink">Queue ({loading ? "\u2026" : queue.length})</h2>
            </div>
            {loading ? <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div> : queue.length === 0 ? <Card><CardBody><EmptyState title="Queue clear" description="No registrations awaiting your review." /></CardBody></Card> : <ul className="flex flex-col gap-3">
                {queue.map((r) => <QueueCard
    key={r.registrationId}
    reg={r}
    active={selected?.registrationId === r.registrationId}
    busy={approve.isPending}
    onSelect={() => setSelectedId(r.registrationId)}
    onApprove={() => doApprove(r.registrationId)}
    onReject={() => {
      setSelectedId(r.registrationId);
      setRejectOpen(true);
    }}
  />)}
              </ul>}
          </div>

          {
    /* Detail */
  }
          <div className="lg:col-span-2">
            {selected ? <InspectionDetail
    reg={selected}
    approving={approve.isPending}
    onApprove={() => doApprove(selected.registrationId)}
    onReject={() => setRejectOpen(true)}
    onView={viewer.view}
  /> : <Card><CardBody><EmptyState title="Select a registration" description="Pick a horse from the queue to inspect its dossier." /></CardBody></Card>}
          </div>
        </div>}

      <Modal
    open={rejectOpen}
    onClose={() => setRejectOpen(false)}
    title="Reject registration"
    footer={<>
            <Button variant="secondary" onClick={() => setRejectOpen(false)} disabled={reject.isPending}>Cancel</Button>
            <Button variant="danger" loading={reject.isPending} disabled={!reason.trim()} onClick={doReject}>Reject</Button>
          </>}
  >
        <Textarea rows={3} placeholder="Reason for rejection…" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>

      <DocumentViewerModal {...viewer.modalProps} />
    </>;
}
function QueueCard({ reg, active, busy, onSelect, onApprove, onReject }) {
  return <li>
      <div className={cn("rounded-2xl border bg-surface p-4", active ? "border-brand-700 ring-1 ring-brand-700" : "border-border")}>
        <button type="button" onClick={onSelect} className="block w-full text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-ink">{reg.horseName ?? "\u2014"}</span>
            <Badge tone={reg.status === "UNDER_REVIEW" ? "warning" : "info"}>{reg.status === "UNDER_REVIEW" ? "Reviewing" : "New"}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted">{reg.ownerName ?? "\u2014"} · {reg.raceName ?? "\u2014"}</p>
          <p className="mt-0.5 text-[11px] text-muted">{reg.registrationCode}</p>
        </button>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="ghost" className="flex-1 text-danger hover:bg-danger/10" onClick={onReject}>Reject</Button>
          <Button size="sm" className="flex-1" loading={busy} onClick={onApprove}>Approve</Button>
        </div>
      </div>
    </li>;
}
function InspectionDetail({ reg, approving, onApprove, onReject, onView }) {
  const verify = useHorseVerification(reg.horseId);
  const dossier = useRegistrationAttachments(reg.registrationId);
  return <Card>
      <CardBody className="flex flex-col gap-5">
        {
    /* Header */
  }
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={reg.horseName ?? "\u2014"} size={56} />
            <div>
              <h2 className="text-xl font-bold text-ink">{reg.horseName ?? "\u2014"}</h2>
              <p className="text-sm text-muted">#{reg.horseCode ?? "\u2014"} · Owner: {reg.ownerName ?? "\u2014"}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge tone="info">{reg.tournamentName ?? "\u2014"}</Badge>
                <Badge tone="neutral">{reg.raceName ?? "\u2014"}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {
    /* Identity / race details + eligibility */
  }
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Registration Details</p>
            <dl className="mt-2 flex flex-col gap-2 text-sm">
              <Row icon={<Trophy className="h-3.5 w-3.5" />} label="Tournament" value={reg.tournamentName ?? "\u2014"} />
              <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Race" value={reg.raceName ?? "\u2014"} />
              <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Submitted" value={reg.submittedAt ? formatDate(reg.submittedAt) : "\u2014"} />
            </dl>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Eligibility Checklist</p>
            {verify.isPending ? <Skeleton className="mt-2 h-24 w-full rounded-xl" /> : <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                <Check2 label="Vaccinations up to date" ok={verify.data?.vaccinationsUpToDate === true} />
                <Check2 label="Fitness certified" ok={verify.data?.fitnessCertified === true} />
                <Check2 label="Passport scan valid" ok={verify.data?.passportScanStatus === "VALID"} />
              </ul>}
          </div>

          {
    /* Dossier */
  }
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Submitted Dossier</p>
            {dossier.isPending ? <Skeleton className="mt-2 h-24 w-full rounded-xl" /> : !dossier.data || dossier.data.length === 0 ? <p className="mt-2 text-sm text-muted">No dossier files attached.</p> : <ul className="mt-2 flex flex-col gap-1.5">
                {dossier.data.map((f) => <li key={f.attachmentId}>
                    <button
    type="button"
    onClick={() => onView(`/attachments/${f.attachmentId}/download`, f.fileName)}
    className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm text-brand-700 hover:bg-subtle"
  >
                      <FileText size={14} /> <span className="truncate">{f.fileName}</span> <Download size={13} className="ml-auto shrink-0" />
                    </button>
                  </li>)}
              </ul>}
          </div>
        </div>

        {
    /* Action bar */
  }
        <div className="flex gap-3 border-t border-border pt-4">
          <Button variant="danger" className="flex-1" leftIcon={<X size={16} />} onClick={onReject}>Reject</Button>
          <Button className="flex-1" leftIcon={<Check size={16} />} loading={approving} onClick={onApprove}>Approve &amp; Clear to Compete</Button>
        </div>
      </CardBody>
    </Card>;
}
function Row({ icon, label, value }) {
  return <div className="flex items-center gap-2">
      <span className="text-muted">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto truncate font-medium text-ink">{value}</span>
    </div>;
}
function Check2({ label, ok }) {
  return <li className="flex items-center gap-2">
      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", ok ? "bg-brand-50 text-success" : "bg-red-50 text-danger")}>
        {ok ? <Check size={12} /> : <X size={12} />}
      </span>
      <span className="text-ink">{label}</span>
    </li>;
}
export {
  PreRaceInspectionPage as default
};
