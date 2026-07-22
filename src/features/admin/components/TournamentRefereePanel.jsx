import { useMemo, useState } from "react";
import { Plus, Trash2, UserCheck } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Modal,
  Select,
  Skeleton,
} from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useInviteTournamentReferee,
  useRevokeTournamentAssignment,
  useStaff,
  useTournamentAssignments,
} from "../hooks";
import { PANEL_ROLE_OPTIONS } from "../constants";

const STATUS_TONE = {
  ACCEPTED: "success",
  INVITED: "warning",
  DECLINED: "danger",
  REVOKED: "neutral",
};
const ROLE_LABEL = Object.fromEntries(
  PANEL_ROLE_OPTIONS.map((o) => [o.value, o.label]),
);

/** Admin: invite referees to officiate a whole tournament (invite/accept flow, §E). */
export function TournamentRefereePanel({ tournamentId }) {
  const toast = useToast();
  const query = useTournamentAssignments(tournamentId);
  const revoke = useRevokeTournamentAssignment();
  const [inviting, setInviting] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const rows = query.data ?? [];
  const activeRefereeIds = rows
    .filter((r) => r.status !== "REVOKED" && r.status !== "DECLINED")
    .map((r) => r.refereeUserId);

  function onRevoke(id) {
    revoke.mutate(id, {
      onSuccess: () => {
        toast.success("Invitation revoked");
        setConfirmId(null);
      },
    });
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-ink">
          <UserCheck size={17} className="text-brand-700" /> Referee Panel
          {rows.length > 0 && (
            <span className="text-sm font-normal text-muted">
              ({rows.length})
            </span>
          )}
        </h2>
        <Button size="sm" onClick={() => setInviting(true)}>
          <Plus size={15} /> Invite Referee
        </Button>
      </div>

      <Card className="mt-3">
        <CardBody className="p-0">
          {query.isPending ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : query.isError ? (
            <EmptyState
              title="Couldn't load the referee panel"
              description="Please reload the page."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No referees invited"
              description="Invite a referee to officiate this tournament."
            />
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <Avatar name={a.refereeName ?? "—"} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {a.refereeName ?? "—"}
                    </p>
                    <p className="text-xs text-muted">
                      Invited{a.invitedAt ? ` ${new Date(a.invitedAt).toLocaleDateString()}` : ""}
                      {a.respondedAt ? ` · responded ${new Date(a.respondedAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  {a.panelRole && (
                    <Badge tone="neutral">
                      {ROLE_LABEL[a.panelRole] ?? a.panelRole}
                    </Badge>
                  )}
                  <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>
                    {a.status}
                  </Badge>
                  {a.status !== "REVOKED" &&
                    (confirmId === a.id ? (
                      <span className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="danger"
                          loading={revoke.isPending}
                          onClick={() => onRevoke(a.id)}
                        >
                          Revoke
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                        >
                          Keep
                        </Button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(a.id)}
                        className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs text-muted hover:bg-subtle hover:text-danger"
                      >
                        <Trash2 size={14} /> Revoke
                      </button>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {inviting && (
        <InviteRefereeModal
          tournamentId={tournamentId}
          excludeRefereeIds={activeRefereeIds}
          onClose={() => setInviting(false)}
        />
      )}
    </>
  );
}

function InviteRefereeModal({ tournamentId, excludeRefereeIds, onClose }) {
  const toast = useToast();
  const staffQuery = useStaff();
  const invite = useInviteTournamentReferee();
  const [refereeUserId, setRefereeUserId] = useState("");
  const [panelRole, setPanelRole] = useState("STEWARD");

  // Only referees not already invited (non-revoked/declined) are selectable.
  const options = useMemo(() => {
    const excluded = new Set(excludeRefereeIds);
    return (staffQuery.data ?? []).filter((s) => !excluded.has(s.userId));
  }, [staffQuery.data, excludeRefereeIds]);

  function submit() {
    if (!refereeUserId) return toast.error("Select a referee");
    invite.mutate(
      { tournamentId, refereeUserId, panelRole },
      {
        onSuccess: () => {
          toast.success("Referee invited");
          onClose();
        },
      },
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite Referee to Tournament"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={invite.isPending}
            disabled={!refereeUserId}
            onClick={submit}
          >
            Send Invitation
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Referee"
          value={refereeUserId}
          onChange={(e) => setRefereeUserId(e.target.value)}
          options={[
            {
              value: "",
              label: staffQuery.isPending
                ? "Loading referees…"
                : options.length
                  ? "— select a referee —"
                  : "No available referees",
            },
            ...options.map((s) => ({ value: s.userId, label: s.fullName })),
          ]}
        />
        <Select
          label="Panel role"
          value={panelRole}
          onChange={(e) => setPanelRole(e.target.value)}
          options={PANEL_ROLE_OPTIONS}
        />
      </div>
    </Modal>
  );
}
