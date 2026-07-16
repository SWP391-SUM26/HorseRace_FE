import { useState } from "react";
import { Button, EmptyState } from "@/common/ui";
import {
  useAcceptRaceAssignment,
  useDeclineRaceAssignment,
  useMyRaceAssignments,
} from "../hooks";

export default function MyRaceAssignmentsPage() {
  const { data = [], isLoading, isError, refetch } = useMyRaceAssignments();
  const accept = useAcceptRaceAssignment();
  const decline = useDeclineRaceAssignment();
  const [declineReason, setDeclineReason] = useState("");

  const assignments = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <EmptyState title="Loading assignments..." description="Please wait while we load your race assignments." />;
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load assignments"
        description="Please reload the page."
        action={<Button onClick={() => refetch()}>Reload</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">My Race Assignments</h1>
        <p className="mt-1 text-sm text-muted">Races an admin assigned you to officiate.</p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState title="No assignments" description="No race assignments are currently assigned to you." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-subtle text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Race</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => {
                const id = item.id ?? item.assignmentId ?? item.refAssignmentId;
                return (
                  <tr key={id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-ink">{item.raceName ?? item.raceCode ?? id}</td>
                    <td className="px-4 py-3">{item.panelRole ?? item.role ?? "-"}</td>
                    <td className="px-4 py-3">{item.refCode ?? "-"}</td>
                    <td className="px-4 py-3">{item.status ?? "-"}</td>
                    <td className="flex flex-wrap gap-2 px-4 py-3">
                      <Button size="sm" onClick={() => accept.mutate(id)} loading={accept.isPending}>Accept</Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => decline.mutate({ id, reason: declineReason || "Declined by referee" })}
                        loading={decline.isPending}
                      >
                        Decline
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-border p-4">
            <label className="text-sm font-medium text-ink" htmlFor="decline-reason">Decline reason</label>
            <input
              id="decline-reason"
              className="mt-2 h-10 w-full rounded-lg border border-border px-3 text-sm"
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="Optional reason used when declining an assignment"
            />
          </div>
        </div>
      )}
    </div>
  );
}
