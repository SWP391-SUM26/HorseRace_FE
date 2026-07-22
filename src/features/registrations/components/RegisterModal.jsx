import { useEffect, useState } from "react";
import { Modal, Button, Select, Spinner } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import { registrationAvailability } from "../api";
import {
  useOpenTournaments,
  useOpenRaces,
  useOwnerHorseOptions,
  useRegisterForTournament,
} from "../hooks";

export function RegisterModal({
  open,
  onClose,
  presetTournamentId,
  presetTournamentName,
  onSubmitted,
}) {
  const tournaments = useOpenTournaments();
  const horses = useOwnerHorseOptions();
  const register = useRegisterForTournament();
  const toast = useToast();
  const [tournamentId, setTournamentId] = useState("");
  const [horseId, setHorseId] = useState("");
  const [raceId, setRaceId] = useState("");
  const [files, setFiles] = useState([]);

  const locked = !!presetTournamentId;
  const effectiveTournamentId = locked ? presetTournamentId : tournamentId;
  const races = useOpenRaces(effectiveTournamentId);

  // Reset the race when the tournament changes (races belong to a tournament).
  useEffect(() => {
    setRaceId("");
  }, [effectiveTournamentId]);

  // The modal stays mounted by the parent, so clear the whole form when it closes
  // (otherwise the previous selections persist and can be resubmitted by mistake).
  useEffect(() => {
    if (!open) {
      setTournamentId("");
      setHorseId("");
      setRaceId("");
      setFiles([]);
    }
  }, [open]);

  const submit = () => {
    if (!effectiveTournamentId || !horseId || !raceId) {
      toast.error("Select a tournament, race and horse");
      return;
    }
    if (files.length === 0) {
      toast.error("Attach the horse's dossier before submitting");
      return;
    }
    register.mutate(
      { tournamentId: effectiveTournamentId, horseId, raceId, files },
      {
        onSuccess: () => {
          // Name the next actor: submitting is not the same as being registered, and not saying so
          // is what left owners thinking nothing had happened.
          toast.success("Registration submitted — awaiting referee review.");
          onSubmitted?.();
          onClose();
        },
      },
    );
  };

  const raceOptions = races.data ?? [];
  const noOpenRaces =
    !!effectiveTournamentId && !races.isPending && raceOptions.length === 0;

  const selectedTournament = (tournaments.data ?? []).find(
    (t) => t.value === effectiveTournamentId,
  );
  const availability = registrationAvailability(
    selectedTournament,
    races.isPending ? 1 : raceOptions.length,
  );
  const blockedReason = availability.ok
    ? null
    : availability.reason === "WINDOW_NOT_OPEN"
      ? `Registration opens on ${formatDate(availability.at)}.`
      : availability.reason === "WINDOW_CLOSED"
        ? `Registration closed on ${formatDate(availability.at)}.`
        : availability.reason === "NO_OPEN_RACES"
          ? "No race in this tournament is open for entries yet. Check back later."
          : "This tournament is not accepting registrations.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register for Tournament"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={register.isPending}
            disabled={
              !effectiveTournamentId ||
              !horseId ||
              !raceId ||
              files.length === 0 ||
              !availability.ok
            }
            onClick={submit}
          >
            Submit Registration
          </Button>
        </>
      }
    >
      {tournaments.isPending || horses.isPending ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-4">
          {locked ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Tournament</span>
              <div className="rounded-lg border border-border bg-subtle px-3 py-2 text-sm text-ink">
                {presetTournamentName ?? "Selected tournament"}
              </div>
            </div>
          ) : (
            <Select
              label="Tournament (open)"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              options={[
                { value: "", label: "— select a tournament —" },
                ...(tournaments.data ?? []),
              ]}
            />
          )}

          <Select
            label="Race (open)"
            value={raceId}
            onChange={(e) => setRaceId(e.target.value)}
            disabled={!effectiveTournamentId || races.isPending || noOpenRaces}
            options={[
              {
                value: "",
                label: !effectiveTournamentId
                  ? "— select a tournament first —"
                  : races.isPending
                    ? "Loading races…"
                    : noOpenRaces
                      ? "No open races in this tournament"
                      : "— select a race —",
              },
              ...raceOptions,
            ]}
          />

          <Select
            label="Horse"
            value={horseId}
            onChange={(e) => setHorseId(e.target.value)}
            options={[
              { value: "", label: "— select a horse —" },
              ...(horses.data ?? []),
            ]}
          />

          {blockedReason && (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
              {blockedReason}
            </p>
          )}


          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink">
              Horse dossier <span className="text-danger">*</span>
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-800"
            />
            <p className="text-xs text-muted">
              Attach the horse's health certificate, passport or vaccination
              records. The referee reviews these before accepting the entry.
            </p>
            {files.length > 0 && (
              <p className="text-xs font-medium text-ink">
                {files.length} file{files.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

