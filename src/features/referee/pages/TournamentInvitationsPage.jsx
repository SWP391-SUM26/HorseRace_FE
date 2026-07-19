import { Button, EmptyState } from "@/common/ui";
import {
  useAcceptTournamentInvitation,
  useMyTournamentInvitations,
  useRejectTournamentInvitation,
} from "../hooks";

export default function TournamentInvitationsPage() {
  const { data = [], isLoading, isError, refetch } = useMyTournamentInvitations();
  const accept = useAcceptTournamentInvitation();
  const reject = useRejectTournamentInvitation();
  const invitations = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <EmptyState title="Loading invitations..." description="Please wait while we load your invitations." />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load invitations"
        description="Please reload the page."
        action={<Button onClick={() => refetch()}>Reload</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Tournament Invitations</h1>
        <p className="mt-1 text-sm text-muted">Accept or reject tournament officiating invitations.</p>
      </div>

      {invitations.length === 0 ? (
        <EmptyState title="No invitations" description="No tournament invitations are currently pending." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-subtle text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Tournament</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((item) => {
                const id = item.id ?? item.invitationId;
                return (
                  <tr key={id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-ink">{item.tournamentName ?? item.tournamentCode ?? id}</td>
                    <td className="px-4 py-3">{item.panelRole ?? item.role ?? "-"}</td>
                    <td className="px-4 py-3">{item.status ?? "-"}</td>
                    <td className="flex flex-wrap gap-2 px-4 py-3">
                      <Button size="sm" onClick={() => accept.mutate(id)} loading={accept.isPending}>Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => reject.mutate(id)} loading={reject.isPending}>
                        Reject
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
