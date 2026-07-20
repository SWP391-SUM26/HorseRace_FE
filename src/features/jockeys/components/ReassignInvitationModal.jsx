import { useMemo, useState } from "react";
import { Modal, Button, Select, Spinner } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useJockeys,
  useJockeySuggestions,
  useReassignInvitation,
} from "../hooks";

/** Edit an invitation by reassigning it to a different eligible jockey for the same race entry. */
export function ReassignInvitationModal({ invitation, onClose }) {
  const toast = useToast();
  const { data: jockeys, isPending: jockeysPending } = useJockeys();
  const { data: suggestions, isPending: suggestionsPending } =
    useJockeySuggestions(invitation.raceId, invitation.horseId);
  const reassign = useReassignInvitation();
  const [jockeyUserId, setJockeyUserId] = useState("");

  // Eligible jockeys for this entry, excluding the currently-invited one.
  const options = useMemo(() => {
    if (!jockeys || !suggestions) return [];
    const byId = new Map(suggestions.map((s) => [s.jockeyUserId, s]));
    return jockeys
      .filter(
        (j) =>
          byId.has(j.userId) &&
          (byId.get(j.userId)?.eligible ?? true) &&
          j.userId !== invitation.jockeyUserId,
      )
      .map((j) => {
        const c = byId.get(j.userId)?.compatibility;
        return {
          value: j.userId,
          label: c != null ? `${j.fullName} · ${c}% match` : j.fullName,
        };
      });
  }, [jockeys, suggestions, invitation.jockeyUserId]);

  const loading = jockeysPending || suggestionsPending;

  const submit = () => {
    if (!jockeyUserId) return toast.error("Select a jockey");
    reassign.mutate(
      {
        assignmentId: invitation.id,
        entryId: invitation.entryId,
        jockeyUserId,
      },
      {
        onSuccess: () => {
          toast.success("Invitation reassigned");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Reassign Jockey"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={reassign.isPending}
            disabled={loading || !jockeyUserId}
            onClick={submit}
          >
            Reassign
          </Button>
        </>
      }
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 rounded-lg bg-subtle px-3 py-2 text-sm">
            <span className="text-muted">Currently invited</span>
            <span className="font-medium text-ink">
              {invitation.jockey} — {invitation.race}
            </span>
          </div>
          <Select
            label="New jockey (eligible only)"
            value={jockeyUserId}
            onChange={(e) => setJockeyUserId(e.target.value)}
            options={[
              {
                value: "",
                label: options.length
                  ? "— select a jockey —"
                  : "No other eligible jockeys",
              },
              ...options,
            ]}
          />

          <p className="text-xs text-muted">
            The current invitation is cancelled and a new one is sent to the
            selected jockey.
          </p>
        </div>
      )}
    </Modal>
  );
}
