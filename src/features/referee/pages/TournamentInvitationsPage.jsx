import { Check, Trophy, X } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import { humanize } from "../api";
import {
  useAcceptTournamentInvitation,
  useMyTournamentInvitations,
  useRejectTournamentInvitation,
} from "../hooks";

/** Referee inbox for tournament-level invitations (admin invites → referee accepts/declines). */
export default function TournamentInvitationsPage() {
  const toast = useToast();
  const query = useMyTournamentInvitations();
  const accept = useAcceptTournamentInvitation();
  const reject = useRejectTournamentInvitation();
  const rows = query.data ?? [];

  function onAccept(id) {
    accept.mutate(id, {
      onSuccess: () => toast.success("Invitation accepted"),
    });
  }
  function onDecline(id) {
    reject.mutate(id, {
      onSuccess: () => toast.success("Invitation declined"),
    });
  }

  return (
    <>
      <PageHeader
        title="Tournament Invitations"
        subtitle="Invitations from admins to officiate a whole tournament. Accept or decline."
      />

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Couldn't load invitations"
          description="Please reload the page."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No pending invitations"
          description="When an admin invites you to officiate a tournament, it appears here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((inv) => {
            const busy = accept.isPending || reject.isPending;
            return (
              <Card key={inv.id}>
                <CardBody className="flex flex-wrap items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Trophy size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">
                        {inv.tournamentName ?? "Tournament"}
                      </p>
                      {inv.panelRole && (
                        <Badge tone="neutral">{humanize(inv.panelRole)}</Badge>
                      )}
                      <Badge tone="warning">{inv.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      Invited
                      {inv.invitedAt ? ` ${formatDate(inv.invitedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => onDecline(inv.id)}
                    >
                      <X size={15} /> Decline
                    </Button>
                    <Button
                      size="sm"
                      loading={accept.isPending}
                      disabled={reject.isPending}
                      onClick={() => onAccept(inv.id)}
                    >
                      <Check size={15} /> Accept
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
