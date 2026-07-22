import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
} from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuth } from "@/common/hooks/useAuth";
import { useToast } from "@/common/providers/ToastProvider";
import { cn } from "@/common/lib/cn";
import { humanize } from "@/features/admin/api";
import {
  useConfirmRaceEntries,
  useConfirmHorseMedical,
  useOwnerRaceRegistrations,
  useConfirmParticipation,
} from "../hooks";

/** Newest-first sort key so a stale REJECTED row can't shadow a re-approved one. */
function regTime(r) {
  const t = r.updatedAt ?? r.createdAt;
  const ms = t ? Date.parse(t) : NaN;
  return Number.isNaN(ms) ? 0 : ms;
}

function ReadinessRow({ label, ready, reason }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-4 last:border-0">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            ready ? "bg-brand-50 text-success" : "bg-red-50 text-danger",
          )}
        >
          {ready ? <Check size={14} /> : <X size={14} />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{label}</p>
          {!ready && reason && (
            <p className="mt-0.5 text-xs text-danger">{reason}</p>
          )}
        </div>
      </div>
      <Badge tone={ready ? "success" : "danger"}>
        {ready ? "Ready" : "Blocked"}
      </Badge>
    </div>
  );
}

export default function ConfirmParticipationPage() {
  const { raceId = null } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const entries = useConfirmRaceEntries(raceId);
  const myEntry = entries.data?.find((e) => e.ownerUserId === user?.id) ?? null;

  const medical = useConfirmHorseMedical(myEntry?.horseId ?? null);
  const confirm = useConfirmParticipation(raceId);
  const regs = useOwnerRaceRegistrations(user?.id ?? null, raceId);
  // Prefer the most recent registration so a stale REJECTED row can't shadow a
  // re-approved one.
  const sortedRegs = [...(regs.data ?? [])].sort((a, b) => regTime(b) - regTime(a));
  const registration =
    sortedRegs.find((r) => r.horseId === myEntry?.horseId) ??
    sortedRegs[0] ??
    null;

  if (!user) return null;

  const backLink = (
    <Link
      to="/owner/race-schedule"
      className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
    >
      <ArrowLeft size={15} /> Back to Race Calendar
    </Link>
  );

  if (entries.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        {backLink}
        <Skeleton className="mt-4 h-8 w-48" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // A failed fetch must not read as "not entered" — surface a distinct,
  // retryable error state.
  if (entries.isError) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        {backLink}
        <Card className="mt-4 p-0">
          <EmptyState
            title="Couldn't load this race entry"
            description="Something went wrong reaching the server — please retry."
            action={
              <Button variant="secondary" onClick={() => entries.refetch()}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!myEntry) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        {backLink}
        <Card className="mt-4 p-0">
          <EmptyState
            title="No entry found"
            description="You don't have a horse entered in this race, or the entry is still being processed."
          />
        </Card>
      </div>
    );
  }

  // ---- Readiness derivation ----
  const jockeyReady = !!(myEntry.jockeyUserId && myEntry.jockeyName);
  const docsReady = registration?.status === "APPROVED";
  const med = medical.data;
  const vetReady =
    !!med && med.healthStatus === "HEALTHY" && med.vaccinationsUpToDate;

  const docsReason = regs.isError
    ? "Couldn't load registration status — please retry"
    : registration
      ? `Registration is ${humanize(registration.status)}`
      : "No registration found for this horse";
  const vetReason = medical.isError
    ? "Couldn't load medical status — please retry"
    : !med
      ? "Medical status unavailable"
      : med.healthStatus !== "HEALTHY"
        ? `Health status is ${humanize(med.healthStatus)}`
        : "Vaccinations not up to date";

  const overallReady = jockeyReady && docsReady && vetReady;
  // RaceParticipant.status was already on the wire but nothing read it, so a
  // confirmed entry looked identical to an unconfirmed one after a refresh.
  const alreadyConfirmed = myEntry.status === "CHECKED_IN";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {backLink}
      <PageHeader
        title="Confirm Participation"
        subtitle={`${myEntry.horseName ?? "Your horse"} · Entry ${myEntry.entryNo ?? "—"}`}
      />

      {/* Overall status banner */}
      <Card
        className={cn(
          "mb-6 flex items-center gap-3 p-5",
          overallReady ? "border-success/40" : "border-danger/40",
        )}
      >
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            overallReady ? "bg-brand-50 text-success" : "bg-red-50 text-danger",
          )}
        >
          {overallReady ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
        </span>
        <div>
          <p className="font-semibold text-ink">
            {alreadyConfirmed
              ? "Participation confirmed"
              : overallReady
                ? "Ready to confirm"
                : "Not ready to race yet"}
          </p>
          <p className="text-sm text-muted">
            {alreadyConfirmed
              ? "Your horse is checked in for this race."
              : overallReady
                ? "All checks passed — you can confirm participation."
                : "Resolve the blocked items below before confirming."}
          </p>
        </div>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Readiness checklist
          </h2>
          <ReadinessRow
            label="Jockey confirmed"
            ready={jockeyReady}
            reason="No jockey assigned yet"
          />
          <ReadinessRow
            label="Documents cleared"
            ready={docsReady}
            reason={docsReason}
          />
          <ReadinessRow
            label="Vet / medical clearance"
            ready={vetReady}
            reason={medical.isPending ? "Checking medical status…" : vetReason}
          />

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {myEntry.jockeyName ? `Rider: ${myEntry.jockeyName}` : "No rider yet"}
              {myEntry.odds ? ` · Odds ${myEntry.odds}` : ""}
            </p>
            <Button
              leftIcon={<Check size={16} />}
              disabled={!overallReady || alreadyConfirmed}
              loading={confirm.isPending}
              onClick={() => {
                if (!myEntry.entryId || !raceId) return;
                confirm.mutate(myEntry.entryId, {
                  onSuccess: () =>
                    toast.success("Participation confirmed. Good luck!"),
                });
              }}
            >
              {alreadyConfirmed
                ? "Participation confirmed"
                : "Confirm participation"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
