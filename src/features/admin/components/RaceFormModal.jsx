import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Modal, Select } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { byDate } from "@/common/lib/sort";
import {
  useCreateRace,
  useUpdateRace,
  useVenues,
  useRaceFieldOptions,
} from "../hooks";

// Fallback option lists so the dropdowns are populated even before the BE field-options / venues
// endpoints are live. Merged with (not replacing) whatever the API returns.
const RACE_TYPE_FALLBACK = [
  "FLAT",
  "JUMP",
  "HARNESS",
  "ENDURANCE",
  "HURDLE",
  "STEEPLECHASE",
];
const TRACK_FALLBACK = [
  "FIRM",
  "GOOD",
  "YIELDING",
  "SOFT",
  "HEAVY",
  "STANDARD",
  "FAST",
  "SLOW",
];
const WEATHER_FALLBACK = [
  "CLEAR",
  "SUNNY",
  "CLOUDY",
  "OVERCAST",
  "WINDY",
  "RAINY",
  "STORM",
  "FOGGY",
];
// Real seeded venue rows (33333333-…-0001..0010) — safe to submit since these venue_ids exist in the DB.
const VENUE_FALLBACK = [
  { venueId: "33333333-0000-4000-8000-000000000001", name: "Trường đua Phú Thọ", city: "TP. Hồ Chí Minh" },
  { venueId: "33333333-0000-4000-8000-000000000002", name: "Trường đua Đại Nam", city: "Bình Dương" },
  { venueId: "33333333-0000-4000-8000-000000000003", name: "Trường đua Sóc Sơn", city: "Hà Nội" },
  { venueId: "33333333-0000-4000-8000-000000000004", name: "Trường đua Vân Đồn", city: "Quảng Ninh" },
  { venueId: "33333333-0000-4000-8000-000000000005", name: "Trường đua Lâm Viên", city: "Lâm Đồng" },
  { venueId: "33333333-0000-4000-8000-000000000006", name: "Trường đua Bà Nà", city: "Đà Nẵng" },
  { venueId: "33333333-0000-4000-8000-000000000007", name: "Trường đua Cần Giờ", city: "TP. Hồ Chí Minh" },
  { venueId: "33333333-0000-4000-8000-000000000008", name: "Trường đua Tam Đảo", city: "Vĩnh Phúc" },
  { venueId: "33333333-0000-4000-8000-000000000009", name: "Trường đua Cát Bà", city: "Hải Phòng" },
  { venueId: "33333333-0000-4000-8000-000000000010", name: "Trung tâm đua quốc gia", city: "Hà Nội" },
];

/** Build <Select> options from a list of DB string values, always including the current value
 *  (so an existing race's saved value stays selectable even if it is the only one). */
function stringOptions(values, current, placeholder) {
  const uniq = [
    ...new Set([...(values ?? []), current].filter((v) => v != null && v !== "")),
  ];
  return [
    { value: "", label: placeholder },
    ...uniq.map((v) => ({ value: v, label: v })),
  ];
}

function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(local) {
  if (!local) return undefined;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Mode-aware schema: the race response types nearly every field nullable, so legacy/partial race
 *  rows exist — fields are required on CREATE but lenient on EDIT so those rows can still be saved.
 *  Cross-field rules (min ≤ max, cutoff ≤ start) apply in both modes whenever both values are set. */
function makeSchema(isEdit) {
  const reqStr = (msg) => z.string().trim().min(1, msg);
  const posInt = (msg) =>
    reqStr(msg).refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "Phải là số nguyên > 0",
    );
  const lenientInt = z
    .string()
    .refine(
      (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) > 0),
      "Phải là số nguyên > 0",
    );
  const opt = (required) => (isEdit ? z.string() : required);

  return z
    .object({
      tournamentId: reqStr("Chọn giải đấu"),
      name: opt(reqStr("Nhập tên vòng đua")),
      raceType: opt(reqStr("Chọn loại đua")).refine(
        (v) => v.length <= 50,
        "Tối đa 50 ký tự",
      ),
      distanceMeter: isEdit ? lenientInt : posInt("Nhập cự ly"),
      trackCondition: opt(reqStr("Chọn tình trạng đường đua")),
      weatherCondition: opt(reqStr("Chọn thời tiết")),
      scheduledStartAt: opt(reqStr("Chọn giờ xuất phát")),
      predictionCutoffAt: opt(reqStr("Chọn hạn dự đoán")),
      minParticipants: isEdit ? lenientInt : posInt("Nhập số tối thiểu"),
      maxParticipants: isEdit ? lenientInt : posInt("Nhập số tối đa"),
      venueId: opt(reqStr("Chọn địa điểm")),
      totalPurse: z
        .string()
        .refine(
          (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
          "Phải là số ≥ 0",
        ),
      prizeDistribution: z.array(
        z.object({ place: z.string(), amount: z.string() }),
      ),
    })
    .refine(
      (v) =>
        v.minParticipants === "" ||
        v.maxParticipants === "" ||
        Number(v.maxParticipants) >= Number(v.minParticipants),
      { path: ["maxParticipants"], message: "Tối đa phải ≥ tối thiểu" },
    )
    .refine(
      (v) =>
        !v.scheduledStartAt ||
        !v.predictionCutoffAt ||
        new Date(v.predictionCutoffAt) <= new Date(v.scheduledStartAt),
      {
        path: ["predictionCutoffAt"],
        message: "Hạn dự đoán phải trước giờ xuất phát",
      },
    );
}

function toDefaults(race, lockedTournamentId) {
  return {
    tournamentId: race?.tournamentId ?? lockedTournamentId ?? "",
    name: race?.name ?? "",
    raceType: race?.raceType ?? "",
    distanceMeter:
      race?.distanceMeter != null ? String(race.distanceMeter) : "",
    trackCondition: race?.trackCondition ?? "",
    weatherCondition: race?.weatherCondition ?? "",
    scheduledStartAt: isoToLocalInput(race?.scheduledStartAt),
    predictionCutoffAt: isoToLocalInput(race?.predictionCutoffAt),
    minParticipants:
      race?.minParticipants != null ? String(race.minParticipants) : "",
    maxParticipants:
      race?.maxParticipants != null ? String(race.maxParticipants) : "",
    venueId: race?.venueId ?? "",
    totalPurse: race?.totalPurse != null ? String(race.totalPurse) : "",
    prizeDistribution:
      race?.prizeDistribution && race.prizeDistribution.length > 0
        ? race.prizeDistribution.map((p) => ({
            place: p.place,
            amount: String(p.amount),
          }))
        : [
            { place: "1st", amount: "" },
            { place: "2nd", amount: "" },
          ],
  };
}

/**
 * Create / edit form for a race.
 *
 * `lockedTournamentId` — when adding from a tournament detail page, lock the
 * tournament so the admin cannot reassign the race.
 */
export function RaceFormModal({
  mode,
  race,
  tournaments,
  lockedTournamentId,
  onClose,
}) {
  const toast = useToast();
  const create = useCreateRace();
  const update = useUpdateRace();
  const venuesQuery = useVenues();
  const fieldOptionsQuery = useRaceFieldOptions();
  const venues = venuesQuery.data ?? [];
  const fieldOptions = fieldOptionsQuery.data;
  const isEdit = mode === "edit";
  const busy = create.isPending || update.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeSchema(isEdit)),
    defaultValues: toDefaults(race, lockedTournamentId),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "prizeDistribution",
  });

  function onValid(v) {
    const body = {
      tournamentId: v.tournamentId,
      name: v.name.trim() || undefined,
      raceType: v.raceType.trim() || undefined,
      distanceMeter: v.distanceMeter !== "" ? Number(v.distanceMeter) : undefined,
      trackCondition: v.trackCondition.trim() || undefined,
      weatherCondition: v.weatherCondition.trim() || undefined,
      // Persist the structured venue FK; also send the venue name for the legacy text column.
      venueId: v.venueId || undefined,
      venue: venues.find((x) => x.venueId === v.venueId)?.name || undefined,
      minParticipants:
        v.minParticipants !== "" ? Number(v.minParticipants) : undefined,
      maxParticipants:
        v.maxParticipants !== "" ? Number(v.maxParticipants) : undefined,
      scheduledStartAt: localInputToIso(v.scheduledStartAt),
      predictionCutoffAt: localInputToIso(v.predictionCutoffAt),
      totalPurse: v.totalPurse !== "" ? Number(v.totalPurse) : undefined,
      prizeDistribution: v.prizeDistribution
        .filter((p) => p.place.trim() !== "" && p.amount.trim() !== "")
        .map((p) => ({ place: p.place.trim(), amount: Number(p.amount) })),
    };
    if (isEdit && race) {
      update.mutate(
        { id: race.raceId, body },
        {
          onSuccess: () => {
            toast.success("Race updated");
            onClose();
          },
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast.success("Race created");
          onClose();
        },
      });
    }
  }

  const tournamentLocked = isEdit || !!lockedTournamentId;
  const lockedName =
    tournaments.find((t) => t.tournamentId === watch("tournamentId"))?.name ??
    race?.tournamentName ??
    "—";

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit Race — ${race?.raceCode ?? ""}` : "Create Race"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {/* Modal footer is a DOM sibling of the body (not inside a <form>), so bind submit via onClick. */}
          <Button loading={busy} onClick={handleSubmit(onValid)}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {tournamentLocked ? (
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Tournament</p>
            <p className="rounded-lg border border-border bg-subtle/40 px-3 py-2 text-sm text-muted">
              {lockedName}
            </p>
          </div>
        ) : (
          <Select
            label="Tournament"
            {...register("tournamentId")}
            error={errors.tournamentId?.message}
            options={[
              { value: "", label: "Select a tournament…" },
              ...[...tournaments].sort(byDate("startDate")).map((t) => ({
                value: t.tournamentId,
                label: t.name,
              })),
            ]}
          />
        )}
        <Input
          label="Race name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="e.g. Qualifier Round A"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Race type"
            {...register("raceType")}
            error={errors.raceType?.message}
            options={stringOptions(
              fieldOptions?.raceTypes,
              race?.raceType,
              fieldOptionsQuery.isPending ? "Đang tải…" : "Chọn loại đua…",
            )}
          />
          <Input
            label="Distance (m)"
            type="number"
            min="1"
            step="1"
            {...register("distanceMeter")}
            error={errors.distanceMeter?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Track condition"
            {...register("trackCondition")}
            error={errors.trackCondition?.message}
            options={stringOptions(
              fieldOptions?.trackConditions,
              race?.trackCondition,
              fieldOptionsQuery.isPending ? "Đang tải…" : "Chọn tình trạng…",
            )}
          />
          <Select
            label="Weather"
            {...register("weatherCondition")}
            error={errors.weatherCondition?.message}
            options={stringOptions(
              fieldOptions?.weatherConditions,
              race?.weatherCondition,
              fieldOptionsQuery.isPending ? "Đang tải…" : "Chọn thời tiết…",
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Start time"
            type="datetime-local"
            {...register("scheduledStartAt")}
            error={errors.scheduledStartAt?.message}
          />
          <Input
            label="Prediction cutoff"
            type="datetime-local"
            {...register("predictionCutoffAt")}
            error={errors.predictionCutoffAt?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Min participants"
            type="number"
            min="1"
            step="1"
            {...register("minParticipants")}
            error={errors.minParticipants?.message}
            placeholder="e.g. 4"
          />
          <Input
            label="Max participants"
            type="number"
            min="1"
            step="1"
            {...register("maxParticipants")}
            error={errors.maxParticipants?.message}
          />
          <Select
            label="Venue"
            {...register("venueId")}
            error={errors.venueId?.message}
            options={[
              {
                value: "",
                label: venuesQuery.isPending
                  ? "Đang tải…"
                  : "Chọn địa điểm…",
              },
              ...venues.map((vn) => ({
                value: vn.venueId,
                label: vn.city ? `${vn.name} — ${vn.city}` : vn.name,
              })),
            ]}
          />
        </div>

        {/* Prize purse — total + per-finish-position amounts (paid to owner + jockey on certify). */}
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
            <div>
              <p className="text-sm font-medium text-ink">Prize distribution</p>
              <p className="text-xs text-muted">
                Hạng 1 và 2 đã có sẵn — chỉ cần nhập số tiền. Thêm hạng khác nếu
                cần.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ place: `${fields.length + 1}th`, amount: "" })}
            >
              + Add place
            </Button>
          </div>
          <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2 px-1 pb-1 text-xs font-medium text-muted">
            <span>Thứ hạng</span>
            <span>Số tiền (VND)</span>
            <span className="sr-only">Xoá</span>
          </div>
          <div className="flex flex-col gap-2">
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="grid grid-cols-[1fr_1.4fr_auto] items-start gap-2"
              >
                <Input
                  placeholder="e.g. 1st"
                  {...register(`prizeDistribution.${i}.place`)}
                />
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Amount (VND)"
                  {...register(`prizeDistribution.${i}.amount`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(i)}
                  aria-label="Remove place"
                >
                  ✕
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-xs text-muted">
                No prize tiers — add places above.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
