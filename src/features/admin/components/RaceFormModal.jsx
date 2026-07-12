import { useState } from "react";
import { Button, Input, Modal, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useCreateRace, useUpdateRace } from "../hooks";
import { errorMessage } from "../constants";
function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(local) {
  if (!local) return void 0;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return void 0;
  return d.toISOString();
}
function RaceFormModal({ mode, race, tournaments, lockedTournamentId, onClose }) {
  const toast = useToast();
  const create = useCreateRace();
  const update = useUpdateRace();
  const isEdit = mode === "edit";
  const busy = create.isPending || update.isPending;
  const [scheduledLocal, setScheduledLocal] = useState(isoToLocalInput(race?.scheduledStartAt));
  const [cutoffLocal, setCutoffLocal] = useState(isoToLocalInput(race?.predictionCutoffAt));
  const [form, setForm] = useState({
    tournamentId: race?.tournamentId ?? lockedTournamentId ?? "",
    name: race?.name ?? "",
    raceType: race?.raceType ?? "",
    distanceMeter: race?.distanceMeter ?? void 0,
    trackCondition: race?.trackCondition ?? "",
    weatherCondition: race?.weatherCondition ?? "",
    venue: race?.venue ?? "",
    maxParticipants: race?.maxParticipants ?? void 0,
    minParticipants: race?.minParticipants ?? void 0
  });
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function save() {
    if (!form.tournamentId) return toast.error("Select a tournament");
    const body = {
      ...form,
      scheduledStartAt: localInputToIso(scheduledLocal),
      predictionCutoffAt: localInputToIso(cutoffLocal)
    };
    if (isEdit && race) {
      update.mutate(
        { id: race.raceId, body },
        { onSuccess: () => {
          toast.success("Race updated");
          onClose();
        }, onError: (e) => toast.error(errorMessage(e)) }
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Race created");
          onClose();
        },
        onError: (e) => toast.error(errorMessage(e))
      });
    }
  }
  const tournamentLocked = isEdit || !!lockedTournamentId;
  const lockedName = tournaments.find((t) => t.tournamentId === form.tournamentId)?.name ?? race?.tournamentName ?? "\u2014";
  return <Modal
    open
    onClose={onClose}
    size="lg"
    title={isEdit ? `Edit Race \u2014 ${race?.raceCode ?? ""}` : "Create Race"}
    footer={<>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button loading={busy} disabled={!form.tournamentId} onClick={save}>{isEdit ? "Save Changes" : "Create"}</Button>
        </>}
  >
      <div className="flex flex-col gap-4">
        {tournamentLocked ? <div>
            <p className="mb-1 text-sm font-medium text-ink">Tournament</p>
            <p className="rounded-lg border border-border bg-subtle/40 px-3 py-2 text-sm text-muted">{lockedName}</p>
          </div> : <Select
    label="Tournament"
    value={form.tournamentId}
    onChange={(e) => set("tournamentId", e.target.value)}
    options={[{ value: "", label: "Select a tournament\u2026" }, ...tournaments.map((t) => ({ value: t.tournamentId, label: t.name }))]}
  />}
        <Input label="Race name" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Qualifier Round A" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Race type" value={form.raceType ?? ""} onChange={(e) => set("raceType", e.target.value)} placeholder="e.g. FLAT" />
          <Input label="Distance (m)" type="number" value={form.distanceMeter ?? ""} onChange={(e) => set("distanceMeter", e.target.value ? Number(e.target.value) : void 0)} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Track condition" value={form.trackCondition ?? ""} onChange={(e) => set("trackCondition", e.target.value)} placeholder="e.g. GOOD" />
          <Input label="Weather" value={form.weatherCondition ?? ""} onChange={(e) => set("weatherCondition", e.target.value)} placeholder="e.g. CLEAR" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Start time" type="datetime-local" value={scheduledLocal} onChange={(e) => setScheduledLocal(e.target.value)} />
          <Input label="Prediction cutoff" type="datetime-local" value={cutoffLocal} onChange={(e) => setCutoffLocal(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Min participants" type="number" value={form.minParticipants ?? ""} onChange={(e) => set("minParticipants", e.target.value ? Number(e.target.value) : void 0)} placeholder="e.g. 4" />
          <Input label="Max participants" type="number" value={form.maxParticipants ?? ""} onChange={(e) => set("maxParticipants", e.target.value ? Number(e.target.value) : void 0)} />
          <Input label="Venue" value={form.venue ?? ""} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Ascot" />
        </div>
      </div>
    </Modal>;
}
export {
  RaceFormModal
};
