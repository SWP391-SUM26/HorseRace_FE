import { useMemo, useState } from "react";
import { Button, EmptyState, Modal, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useOpenRaces,
  useOpenTournaments,
  useOwnerHorseOptions,
  useRegisterForTournament
} from "../hooks";

function RegisterModal({ open, onClose, presetTournamentId = "", presetTournamentName = "" }) {
  const toast = useToast();
  const [horseId, setHorseId] = useState("");
  const [tournamentId, setTournamentId] = useState(presetTournamentId);
  const [raceId, setRaceId] = useState("");
  const [files, setFiles] = useState([]);
  const selectedTournamentId = presetTournamentId || tournamentId;

  const horsesQuery = useOwnerHorseOptions();
  const tournamentsQuery = useOpenTournaments();
  const racesQuery = useOpenRaces(selectedTournamentId);
  const registerMutation = useRegisterForTournament();

  const horseOptions = useMemo(
    () => [{ value: "", label: "Choose horse" }, ...(horsesQuery.data ?? [])],
    [horsesQuery.data]
  );

  const tournamentOptions = useMemo(() => {
    const options = tournamentsQuery.data ?? [];
    const hasPreset = presetTournamentId && options.some((item) => item.value === presetTournamentId);
    return [
      { value: "", label: "Choose tournament" },
      ...(hasPreset || !presetTournamentId
        ? options
        : [{ value: presetTournamentId, label: presetTournamentName || "Selected tournament" }, ...options])
    ];
  }, [presetTournamentId, presetTournamentName, tournamentsQuery.data]);

  const raceOptions = useMemo(
    () => [{ value: "", label: "Choose race" }, ...(racesQuery.data ?? [])],
    [racesQuery.data]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!horseId || !selectedTournamentId) {
      toast.error("Please select a horse and tournament.");
      return;
    }

    registerMutation.mutate(
      {
        horseId,
        tournamentId: selectedTournamentId,
        raceId: raceId || undefined,
        files
      },
      {
        onSuccess: () => {
          toast.success("Registration submitted.");
          onClose();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Could not submit registration.");
        }
      }
    );
  };

  const isLoading = horsesQuery.isPending || tournamentsQuery.isPending;
  const hasLoadError = horsesQuery.isError || tournamentsQuery.isError;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit Registration"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="owner-register-tournament-form" loading={registerMutation.isPending}>
            Submit
          </Button>
        </>
      }
    >
      {hasLoadError ? (
        <EmptyState title="Could not load registration data" description="Please reload and try again." />
      ) : (
        <form id="owner-register-tournament-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Select
            label="Horse"
            value={horseId}
            onChange={(event) => setHorseId(event.target.value)}
            options={horseOptions}
            disabled={isLoading || registerMutation.isPending}
          />

          <Select
            label="Tournament"
            value={selectedTournamentId}
            onChange={(event) => {
              setTournamentId(event.target.value);
              setRaceId("");
            }}
            options={tournamentOptions}
            disabled={isLoading || registerMutation.isPending || Boolean(presetTournamentId)}
          />

          <Select
            label="Race"
            value={raceId}
            onChange={(event) => setRaceId(event.target.value)}
            options={raceOptions}
            disabled={!selectedTournamentId || racesQuery.isPending || registerMutation.isPending}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="registration-files">
              Registration Document
            </label>
            <input
              id="registration-files"
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:font-semibold file:text-white"
              disabled={registerMutation.isPending}
            />
            <p className="text-xs text-muted">Upload supporting registration documents. PDF, PNG, or JPG.</p>
          </div>
        </form>
      )}
    </Modal>
  );
}

export {
  RegisterModal
};
