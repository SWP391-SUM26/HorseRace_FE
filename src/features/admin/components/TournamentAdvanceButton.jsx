import { Button } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import {
  usePublishTournament,
  useOpenTournamentRegistration,
  useCloseTournamentRegistration,
  useStartTournament,
  useCompleteTournament
} from "../hooks";
const NEXT = {
  DRAFT: { label: "Publish", toast: "Tournament published", step: "publish" },
  PUBLISHED: { label: "Open Registration", toast: "Registration opened", step: "open" },
  REGISTRATION_OPEN: { label: "Close Registration", toast: "Registration closed", step: "close" },
  REGISTRATION_CLOSED: { label: "Start Tournament", toast: "Tournament started", step: "start" },
  ONGOING: { label: "Complete Tournament", toast: "Tournament completed", step: "complete" }
};
function TournamentAdvanceButton({ tournamentId, status }) {
  const toast = useToast();
  const publish = usePublishTournament();
  const open = useOpenTournamentRegistration();
  const close = useCloseTournamentRegistration();
  const start = useStartTournament();
  const complete = useCompleteTournament();
  const next = NEXT[status];
  if (!next) return null;
  const mutation = { publish, open, close, start, complete }[next.step];
  return <Button
    size="sm"
    loading={mutation.isPending}
    onClick={() => mutation.mutate(tournamentId, { onSuccess: () => toast.success(next.toast) })}
  >
      {next.label}
    </Button>;
}
export {
  TournamentAdvanceButton
};
