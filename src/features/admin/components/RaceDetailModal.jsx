import { useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Modal, Skeleton } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { useToast } from "@/common/providers/ToastProvider";
import { formatDate } from "@/common/lib/format";
import {
  useCancelRace,
  useDeleteRace,
  useFinishRace,
  useHorse,
  useRace,
  useRaceEntries,
  useScheduleRace,
  useStartRace,
  useUser,
} from "../hooks";
import { humanize } from "../api";
import { RACE_STATUS_LABEL, RACE_STATUS_TONE } from "../constants";
import { RaceFormModal } from "./RaceFormModal";

const money = (v) => `${Math.round(v).toLocaleString("vi-VN")}₫`;

const TERMINAL = ["FINISHED", "OFFICIAL", "CANCELLED"];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "—"}</p>
    </div>
  );
}

/** Compute "N yrs" from an ISO date of birth. */
function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const yrs = Math.floor(
    (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000),
  );
  return yrs >= 0 ? `${yrs} yr${yrs === 1 ? "" : "s"}` : null;
}

/** A bordered panel grouping one participant's horse / owner / jockey info. */
function InfoPanel({ title, loading, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      {loading ? <Skeleton className="h-16 w-full rounded" /> : children}
    </div>
  );
}

/** A label/value line inside an InfoPanel. */
function KV({ k, v }) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-xs">
      <span className="shrink-0 text-muted">{k}</span>
      <span className="truncate text-right text-ink">{v ?? "—"}</span>
    </div>
  );
}

/** One participant row that expands to reveal horse, owner and jockey details. */
function ParticipantRow({ p }) {
  const [open, setOpen] = useState(false);
  const horse = useHorse(open ? p.horseId : null);
  const owner = useUser(open ? p.ownerUserId : null);
  const jockey = useUser(open && p.jockeyUserId ? p.jockeyUserId : null);
  const h = horse.data;
  const o = owner.data;
  const j = jockey.data;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-subtle/40"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-3 py-2 text-muted">
          <span className="inline-flex items-center gap-1">
            <ChevronRight
              size={14}
              className={cn("transition-transform", open && "rotate-90")}
            />
            {p.entryNo ?? "—"}
          </span>
        </td>
        <td className="px-3 py-2 font-medium text-ink">{p.horseName ?? "—"}</td>
        <td className="px-3 py-2 text-muted">{p.ownerName ?? "—"}</td>
        <td className="px-3 py-2">
          {p.jockeyName ? (
            <Badge tone="success">{p.jockeyName}</Badge>
          ) : (
            <Badge tone="warning">Awaiting jockey</Badge>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-subtle/30">
          <td colSpan={4} className="px-3 pb-3 pt-1">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoPanel title="Horse" loading={horse.isPending}>
                <p className="mb-1 text-sm font-semibold text-ink">
                  {h?.name ?? p.horseName ?? "—"}
                </p>
                <KV k="Code" v={h?.horseCode} />
                <KV k="Breed" v={h?.breed && humanize(h.breed)} />
                <KV k="Gender" v={h?.gender && humanize(h.gender)} />
                <KV k="Color" v={h?.color} />
                <KV k="Age" v={ageFromDob(h?.dateOfBirth)} />
                <KV k="Weight" v={h?.weight != null ? `${h.weight} kg` : null} />
                <KV k="Health" v={h?.healthStatus && humanize(h.healthStatus)} />
                <KV k="Origin" v={h?.originCountry} />
              </InfoPanel>
              <InfoPanel title="Owner" loading={owner.isPending}>
                <p className="mb-1 text-sm font-semibold text-ink">
                  {o?.fullName ?? p.ownerName ?? "—"}
                </p>
                <KV k="Email" v={o?.email} />
                <KV k="Phone" v={o?.phone} />
                <KV k="Status" v={o?.status && humanize(o.status)} />
              </InfoPanel>
              <InfoPanel
                title="Jockey"
                loading={!!p.jockeyUserId && jockey.isPending}
              >
                {!p.jockeyUserId ? (
                  <p className="text-xs text-muted">No jockey confirmed yet.</p>
                ) : (
                  <>
                    <p className="mb-1 text-sm font-semibold text-ink">
                      {j?.fullName ?? p.jockeyName ?? "—"}
                    </p>
                    <KV k="Email" v={j?.email} />
                    <KV k="Phone" v={j?.phone} />
                    <KV k="Status" v={j?.status && humanize(j.status)} />
                  </>
                )}
              </InfoPanel>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-card px-3 py-2 text-xs text-muted">
              <span>
                Entry <span className="text-ink">{p.entryCode ?? "—"}</span>
              </span>
              <span>
                Lane / Draw{" "}
                <span className="text-ink">
                  {p.drawStall ?? p.laneNo ?? "—"}
                </span>
              </span>
              <span>
                Weight carried{" "}
                <span className="text-ink">
                  {p.weightCarriedLbs != null
                    ? `${p.weightCarriedLbs} lbs`
                    : "—"}
                </span>
              </span>
              <span>
                Recent form <span className="text-ink">{p.recentForm ?? "—"}</span>
              </span>
              <span>
                Odds <span className="text-ink">{p.odds ?? "—"}</span>
              </span>
              <span>
                Entry status{" "}
                <span className="text-ink">
                  {p.status ? humanize(p.status) : "—"}
                </span>
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * Read-only race detail with the admin lifecycle actions (publish, start,
 * finish, cancel, delete) and an inline switch into the edit form.
 *
 * `fallback` is the list-row data shown while the fresh detail loads.
 */
export function RaceDetailModal({ raceId, fallback, tournaments, onClose }) {
  const toast = useToast();
  const query = useRace(raceId);
  const entriesQuery = useRaceEntries(raceId);
  const schedule = useScheduleRace();
  const start = useStartRace();
  const finish = useFinishRace();
  const cancel = useCancelRace();
  const del = useDeleteRace();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const race = query.data ?? fallback ?? null;

  if (editing && race) {
    return (
      <RaceFormModal
        mode="edit"
        race={race}
        tournaments={tournaments}
        onClose={() => setEditing(false)}
      />
    );
  }

  function onOpen() {
    if (!race?.scheduledStartAt)
      return toast.error("Set a start time before opening entries");
    schedule.mutate(
      { id: raceId, scheduledStartAt: race.scheduledStartAt },
      { onSuccess: () => toast.success("Race opened for entries") },
    );
  }
  function onStart() {
    start.mutate(raceId, {
      onSuccess: () => toast.success("Race started — entries are now locked"),
    });
  }
  function onFinish() {
    finish.mutate(raceId, {
      onSuccess: () =>
        toast.success("Race finished — referees can now file reports"),
    });
  }
  function onCancel() {
    cancel.mutate(raceId, {
      onSuccess: () => toast.success("Race cancelled"),
    });
  }
  function onDelete() {
    del.mutate(raceId, {
      onSuccess: () => {
        toast.success("Race deleted");
        onClose();
      },
    });
  }

  // BE (RaceServiceImpl) allows PUT/cancel only for SCHEDULED/OPEN/CLOSED/RUNNING;
  // FINISHED/OFFICIAL/CANCELLED are terminal and reject edits with "Invalid status transition".
  const canCancel = race ? !TERMINAL.includes(race.status) : false;
  const editable = canCancel;

  // Roster readiness: confirmed runners (jockey accepted) vs the race's minimum.
  const confirmed = race?.confirmedCount ?? 0;
  const minP = race?.minParticipants ?? null;
  const enough = minP != null ? confirmed >= minP : null; // null = no minimum set
  const shortBy = minP != null ? Math.max(0, minP - confirmed) : 0;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={race ? race.name ?? race.raceCode : "Race detail"}
      footer={
        race &&
        (confirmDelete ? (
          <>
            <span className="mr-auto text-sm text-danger">
              Delete this race?
            </span>
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
              disabled={del.isPending}
            >
              Keep
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={onDelete}
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="mr-auto border border-danger text-danger hover:bg-danger/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} /> Delete
            </Button>
            {race.status === "SCHEDULED" && (
              <Button
                variant="secondary"
                loading={schedule.isPending}
                onClick={onOpen}
              >
                Publish (open registration)
              </Button>
            )}
            {(race.status === "OPEN" || race.status === "CLOSED") && (
              <Button loading={start.isPending} onClick={onStart}>
                Start race
              </Button>
            )}
            {race.status === "RUNNING" && (
              <Button loading={finish.isPending} onClick={onFinish}>
                End race
              </Button>
            )}
            {canCancel && (
              <Button
                variant={enough === false ? "danger" : "secondary"}
                loading={cancel.isPending}
                onClick={onCancel}
              >
                Cancel race{enough === false ? " (not enough)" : ""}
              </Button>
            )}
            <Button
              disabled={!editable}
              title={
                !editable
                  ? "Finished, official, or cancelled races cannot be edited"
                  : undefined
              }
              onClick={() => setEditing(true)}
            >
              <Pencil size={15} /> Edit
            </Button>
          </>
        ))
      }
    >
      {query.isPending && !fallback ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : !race ? (
        <p className="text-sm text-muted">Couldn't load this race.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={RACE_STATUS_TONE[race.status]}>
              {RACE_STATUS_LABEL[race.status] ?? race.status}
            </Badge>
            <span className="text-xs text-muted">{race.raceCode}</span>
            {race.tournamentName && (
              <span className="ml-auto text-xs text-muted">
                {race.tournamentName}
              </span>
            )}
          </div>

          {/* Roster readiness — confirmed runners vs the minimum, so the admin can proceed or cancel. */}
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5",
              enough === true
                ? "bg-brand-50"
                : enough === false
                  ? "bg-amber-50"
                  : "bg-subtle/60",
            )}
          >
            <div className="text-sm">
              <span className="font-semibold text-ink">
                {confirmed} confirmed runner{confirmed === 1 ? "" : "s"}
              </span>
              <span className="text-muted">
                {" · "}
                {race.entriesCount ?? 0} entered
                {minP != null ? ` · min ${minP}` : ""}
                {race.maxParticipants != null
                  ? ` · max ${race.maxParticipants}`
                  : ""}
              </span>
            </div>
            {enough === true && <Badge tone="success">Ready to proceed</Badge>}
            {enough === false && (
              <Badge tone="warning">Not enough — need {shortBy} more</Badge>
            )}
            {enough === null && <Badge tone="neutral">No minimum set</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Race type" value={race.raceType} />
            <Field
              label="Distance"
              value={race.distanceMeter ? `${race.distanceMeter} m` : null}
            />
            <Field
              label="Confirmed / Max"
              value={`${confirmed} / ${race.maxParticipants ?? "—"}`}
            />
            <Field label="Track" value={race.trackCondition} />
            <Field label="Weather" value={race.weatherCondition} />
            <Field label="Venue" value={race.venueName ?? race.venue} />
            <Field
              label="Start time"
              value={
                race.scheduledStartAt ? formatDate(race.scheduledStartAt) : null
              }
            />
            <Field
              label="Prediction cutoff"
              value={
                race.predictionCutoffAt
                  ? formatDate(race.predictionCutoffAt)
                  : null
              }
            />
            <Field
              label="Total purse"
              value={
                race.totalPurse != null
                  ? money(race.totalPurse)
                  : null
              }
            />
            <Field
              label="Entry fee"
              value={
                race.entryFee != null
                  ? money(race.entryFee)
                  : null
              }
            />
            <Field
              label="Actual start"
              value={race.actualStartAt ? formatDate(race.actualStartAt) : null}
            />
            <Field
              label="Actual end"
              value={race.actualEndAt ? formatDate(race.actualEndAt) : null}
            />
          </div>

          {/* Participants — who's entered, with their owner + jockey, to inform the proceed/cancel call. */}
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Participants ({entriesQuery.data?.length ?? 0})
              </p>
              {!!entriesQuery.data?.length && (
                <p className="text-[11px] text-muted">
                  Click a row for horse, owner &amp; jockey details
                </p>
              )}
            </div>
            {entriesQuery.isPending ? (
              <Skeleton className="h-20 w-full rounded-lg" />
            ) : !entriesQuery.data || entriesQuery.data.length === 0 ? (
              <p className="rounded-lg bg-subtle/60 px-3 py-3 text-sm text-muted">
                No horses entered yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-subtle/40 text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Horse</th>
                      <th className="px-3 py-2 font-medium">Owner</th>
                      <th className="px-3 py-2 font-medium">Jockey</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entriesQuery.data.map((e) => (
                      <ParticipantRow key={e.entryId} p={e} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {!editable && (
            <p className="rounded-lg bg-subtle/60 px-3 py-2 text-xs text-muted">
              This race is {RACE_STATUS_LABEL[race.status] ?? race.status} and
              can no longer be edited, scheduled, or cancelled. Only races that
              are scheduled, open, closed, or running are editable.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
