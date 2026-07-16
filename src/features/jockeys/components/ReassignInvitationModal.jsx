import { useMemo, useState } from "react";
import { Modal, Button, Select, Spinner } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useJockeys, useJockeySuggestions, useReassignInvitation } from "../hooks";

export function ReassignInvitationModal({ invitation, onClose }) {
  const toast = useToast();
  const { data: jockeys, isPending: jockeysPending } = useJockeys();
  const { data: suggestions, isPending: suggestionsPending } = useJockeySuggestions(
    invitation.raceId,
    invitation.horseId
  );
  const reassign = useReassignInvitation();
  const [jockeyUserId, setJockeyUserId] = useState("");

  const options = useMemo(() => {
    if (!jockeys || !suggestions) return [];
    const byId = new Map(suggestions.map((suggestion) => [suggestion.jockeyUserId, suggestion]));
    return jockeys
      .filter((jockey) => {
        const suggestion = byId.get(jockey.userId);
        return suggestion && (suggestion.eligible ?? true) && jockey.userId !== invitation.jockeyUserId;
      })
      .map((jockey) => {
        const compatibility = byId.get(jockey.userId)?.compatibility;
        return {
          value: jockey.userId,
          label: compatibility != null ? `${jockey.fullName} · ${compatibility}% match` : jockey.fullName
        };
      });
  }, [jockeys, suggestions, invitation.jockeyUserId]);

  const loading = jockeysPending || suggestionsPending;

  const submit = () => {
    if (!jockeyUserId) {
      toast.error("Select a jockey");
      return;
    }
    reassign.mutate(
      { assignmentId: invitation.id, entryId: invitation.entryId, jockeyUserId },
      {
        onSuccess: () => {
          toast.success("Invitation reassigned");
          onClose();
        }
      }
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Reassign Jockey"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={reassign.isPending} disabled={loading || !jockeyUserId} onClick={submit}>
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
            <span className="font-medium text-ink">{invitation.jockey} — {invitation.race}</span>
          </div>
          <Select
            label="New jockey (eligible only)"
            value={jockeyUserId}
            onChange={(event) => setJockeyUserId(event.target.value)}
            options={[
              { value: "", label: options.length ? "— select a jockey —" : "No other eligible jockeys" },
              ...options
            ]}
          />
          <p className="text-xs text-muted">
            The current invitation is cancelled and a new one is sent to the selected jockey.
          </p>
        </div>
      )}
    </Modal>
  );
}
