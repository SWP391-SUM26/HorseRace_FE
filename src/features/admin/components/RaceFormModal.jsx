import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Modal, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useCreateRace, useUpdateRace } from "../hooks";
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
function makeSchema(isEdit) {
  const reqStr = (msg) => z.string().trim().min(1, msg);
  const posInt = (msg) => reqStr(msg).refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, "Ph\u1EA3i l\xE0 s\u1ED1 nguy\xEAn > 0");
  const lenientInt = z.string().refine((v) => v === "" || Number.isInteger(Number(v)) && Number(v) > 0, "Ph\u1EA3i l\xE0 s\u1ED1 nguy\xEAn > 0");
  const opt = (required) => isEdit ? z.string() : required;
  return z.object({
    tournamentId: reqStr("Ch\u1ECDn gi\u1EA3i \u0111\u1EA5u"),
    name: opt(reqStr("Nh\u1EADp t\xEAn v\xF2ng \u0111ua")),
    raceType: opt(reqStr("Nh\u1EADp lo\u1EA1i \u0111ua")).refine((v) => v.length <= 50, "T\u1ED1i \u0111a 50 k\xFD t\u1EF1"),
    distanceMeter: isEdit ? lenientInt : posInt("Nh\u1EADp c\u1EF1 ly"),
    trackCondition: opt(reqStr("Nh\u1EADp t\xECnh tr\u1EA1ng \u0111\u01B0\u1EDDng \u0111ua")),
    weatherCondition: opt(reqStr("Nh\u1EADp th\u1EDDi ti\u1EBFt")),
    scheduledStartAt: opt(reqStr("Ch\u1ECDn gi\u1EDD xu\u1EA5t ph\xE1t")),
    predictionCutoffAt: opt(reqStr("Ch\u1ECDn h\u1EA1n d\u1EF1 \u0111o\xE1n")),
    minParticipants: isEdit ? lenientInt : posInt("Nh\u1EADp s\u1ED1 t\u1ED1i thi\u1EC3u"),
    maxParticipants: isEdit ? lenientInt : posInt("Nh\u1EADp s\u1ED1 t\u1ED1i \u0111a"),
    venue: opt(reqStr("Nh\u1EADp \u0111\u1ECBa \u0111i\u1EC3m")),
    totalPurse: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)) && Number(v) >= 0, "Ph\u1EA3i l\xE0 s\u1ED1 \u2265 0"),
    entryFee: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)) && Number(v) >= 0, "Ph\u1EA3i l\xE0 s\u1ED1 \u2265 0"),
    prizeDistribution: z.array(z.object({ place: z.string(), amount: z.string() }))
  }).refine(
    (v) => v.minParticipants === "" || v.maxParticipants === "" || Number(v.maxParticipants) >= Number(v.minParticipants),
    { path: ["maxParticipants"], message: "T\u1ED1i \u0111a ph\u1EA3i \u2265 t\u1ED1i thi\u1EC3u" }
  ).refine(
    (v) => !v.scheduledStartAt || !v.predictionCutoffAt || new Date(v.predictionCutoffAt) <= new Date(v.scheduledStartAt),
    { path: ["predictionCutoffAt"], message: "H\u1EA1n d\u1EF1 \u0111o\xE1n ph\u1EA3i tr\u01B0\u1EDBc gi\u1EDD xu\u1EA5t ph\xE1t" }
  );
}
function toDefaults(race, lockedTournamentId) {
  return {
    tournamentId: race?.tournamentId ?? lockedTournamentId ?? "",
    name: race?.name ?? "",
    raceType: race?.raceType ?? "",
    distanceMeter: race?.distanceMeter != null ? String(race.distanceMeter) : "",
    trackCondition: race?.trackCondition ?? "",
    weatherCondition: race?.weatherCondition ?? "",
    scheduledStartAt: isoToLocalInput(race?.scheduledStartAt),
    predictionCutoffAt: isoToLocalInput(race?.predictionCutoffAt),
    minParticipants: race?.minParticipants != null ? String(race.minParticipants) : "",
    maxParticipants: race?.maxParticipants != null ? String(race.maxParticipants) : "",
    venue: race?.venue ?? "",
    totalPurse: race?.totalPurse != null ? String(race.totalPurse) : "",
    entryFee: race?.entryFee != null ? String(race.entryFee) : "",
    prizeDistribution: race?.prizeDistribution && race.prizeDistribution.length > 0 ? race.prizeDistribution.map((p) => ({ place: p.place, amount: String(p.amount) })) : [{ place: "1st", amount: "" }]
  };
}
function RaceFormModal({ mode, race, tournaments, lockedTournamentId, onClose }) {
  const toast = useToast();
  const create = useCreateRace();
  const update = useUpdateRace();
  const isEdit = mode === "edit";
  const busy = create.isPending || update.isPending;
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: toDefaults(race, lockedTournamentId)
  });
  const { fields, append, remove } = useFieldArray({ control, name: "prizeDistribution" });
  function onValid(v) {
    const body = {
      tournamentId: v.tournamentId,
      name: v.name.trim() || void 0,
      raceType: v.raceType.trim() || void 0,
      distanceMeter: v.distanceMeter !== "" ? Number(v.distanceMeter) : void 0,
      trackCondition: v.trackCondition.trim() || void 0,
      weatherCondition: v.weatherCondition.trim() || void 0,
      venue: v.venue.trim() || void 0,
      minParticipants: v.minParticipants !== "" ? Number(v.minParticipants) : void 0,
      maxParticipants: v.maxParticipants !== "" ? Number(v.maxParticipants) : void 0,
      scheduledStartAt: localInputToIso(v.scheduledStartAt),
      predictionCutoffAt: localInputToIso(v.predictionCutoffAt),
      totalPurse: v.totalPurse !== "" ? Number(v.totalPurse) : void 0,
      entryFee: v.entryFee !== "" ? Number(v.entryFee) : void 0,
      prizeDistribution: v.prizeDistribution.filter((p) => p.place.trim() !== "" && p.amount.trim() !== "").map((p) => ({ place: p.place.trim(), amount: Number(p.amount) }))
    };
    if (isEdit && race) {
      update.mutate(
        { id: race.raceId, body },
        { onSuccess: () => {
          toast.success("Race updated");
          onClose();
        } }
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Race created");
          onClose();
        }
      });
    }
  }
  const tournamentLocked = isEdit || !!lockedTournamentId;
  const lockedName = tournaments.find((t) => t.tournamentId === watch("tournamentId"))?.name ?? race?.tournamentName ?? "\u2014";
  return <Modal
    open
    onClose={onClose}
    size="lg"
    title={isEdit ? `Edit Race \u2014 ${race?.raceCode ?? ""}` : "Create Race"}
    footer={<>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          {
      /* Modal footer is a DOM sibling of the body (not inside a <form>), so bind submit via onClick. */
    }
          <Button loading={busy} onClick={handleSubmit(onValid)}>{isEdit ? "Save Changes" : "Create"}</Button>
        </>}
  >
      <div className="flex flex-col gap-4">
        {tournamentLocked ? <div>
            <p className="mb-1 text-sm font-medium text-ink">Tournament</p>
            <p className="rounded-lg border border-border bg-subtle/40 px-3 py-2 text-sm text-muted">{lockedName}</p>
          </div> : <Select
    label="Tournament"
    {...register("tournamentId")}
    error={errors.tournamentId?.message}
    options={[{ value: "", label: "Select a tournament\u2026" }, ...tournaments.map((t) => ({ value: t.tournamentId, label: t.name }))]}
  />}
        <Input label="Race name" {...register("name")} error={errors.name?.message} placeholder="e.g. Qualifier Round A" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Race type" {...register("raceType")} error={errors.raceType?.message} placeholder="e.g. FLAT" />
          <Input label="Distance (m)" type="number" min="1" step="1" {...register("distanceMeter")} error={errors.distanceMeter?.message} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Track condition" {...register("trackCondition")} error={errors.trackCondition?.message} placeholder="e.g. GOOD" />
          <Input label="Weather" {...register("weatherCondition")} error={errors.weatherCondition?.message} placeholder="e.g. CLEAR" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Start time" type="datetime-local" {...register("scheduledStartAt")} error={errors.scheduledStartAt?.message} />
          <Input label="Prediction cutoff" type="datetime-local" {...register("predictionCutoffAt")} error={errors.predictionCutoffAt?.message} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Min participants" type="number" min="1" step="1" {...register("minParticipants")} error={errors.minParticipants?.message} placeholder="e.g. 4" />
          <Input label="Max participants" type="number" min="1" step="1" {...register("maxParticipants")} error={errors.maxParticipants?.message} />
          <Input label="Venue" {...register("venue")} error={errors.venue?.message} placeholder="e.g. Ascot" />
        </div>

        {
    /* Entry fee — the owner pays this into the house wallet when a horse enters this race. */
  }
        <Input
    label="Entry fee (VND)"
    type="number"
    min="0"
    step="1000"
    {...register("entryFee")}
    error={errors.entryFee?.message}
    placeholder="e.g. 500000 (leave blank for free entry)"
  />

        {
    /* Prize purse — total + per-finish-position amounts (paid to owner + jockey on certify). */
  }
        <div className="rounded-xl border border-border bg-subtle/30 p-3">
          <Input
    label="Total purse (VND)"
    type="number"
    min="0"
    step="1000"
    {...register("totalPurse")}
    error={errors.totalPurse?.message}
    placeholder="e.g. 100000000"
  />
          <div className="mt-3 mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Prize distribution</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => append({ place: "", amount: "" })}>
              + Add place
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((f, i) => <div key={f.id} className="grid grid-cols-[1fr_1.4fr_auto] items-start gap-2">
                <Input placeholder="Place (e.g. 1st)" {...register(`prizeDistribution.${i}.place`)} />
                <Input type="number" min="0" step="1000" placeholder="Amount (VND)" {...register(`prizeDistribution.${i}.amount`)} />
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Remove place">✕</Button>
              </div>)}
            {fields.length === 0 && <p className="text-xs text-muted">No prize tiers — add places above.</p>}
          </div>
        </div>
      </div>
    </Modal>;
}
export {
  RaceFormModal
};
