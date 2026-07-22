import { apiClient } from "@/common/lib/apiClient";

function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

export function mapRegistration(r) {
  return {
    id: r.registrationId,
    code: r.registrationCode,
    status: r.status,
    tournament: r.tournamentName ?? "—",
    horse: r.horseName,
    horseCode: r.horseCode,
    raceId: r.raceId,
    race: r.raceName,
    submittedAt: r.submittedAt,
    rejectionReason: r.rejectionReason,
  };
}

const TERMINAL = ["REJECTED", "WITHDRAWN", "REMOVED"];
export function canWithdraw(status) {
  return !TERMINAL.includes(status);
}

/** GET /registrations is NOT owner-scoped by default — pass ownerUserId to filter to mine. */
export async function fetchMyRegistrations(ownerUserId) {
  const { data } = await apiClient.get("/registrations", {
    params: { ownerUserId, size: 100 },
  });
  return toArray(data.data).map(mapRegistration);
}

/** Create the registration and return its id (so the dossier can be attached to it). */
export async function registerForTournament(tournamentId, horseId, raceId) {
  const { data } = await apiClient.post("/registrations", {
    tournamentId,
    horseId,
    raceId,
  });
  return data.data.registrationId;
}

/** Upload one dossier file attached to a registration. */
export async function uploadRegistrationAttachment(registrationId, file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerEntityType", "TOURNAMENT_REGISTRATION");
  form.append("ownerEntityId", registrationId);
  await apiClient.post("/attachments", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/** List the dossier files attached to a registration (for the referee's review). */
export async function fetchRegistrationAttachments(registrationId) {
  const { data } = await apiClient.get("/attachments", {
    params: {
      ownerEntityType: "TOURNAMENT_REGISTRATION",
      ownerEntityId: registrationId,
    },
  });
  return data.data ?? [];
}

export async function withdrawRegistration(id) {
  await apiClient.patch(`/registrations/${id}/withdraw`);
}

// The BE accepts registrations for tournaments that are PUBLISHED or REGISTRATION_OPEN.
const OPEN_TOURNAMENT_STATUSES = ["PUBLISHED", "REGISTRATION_OPEN"];

export async function fetchOpenTournaments() {
  const { data } = await apiClient.get("/tournaments", {
    params: { size: 100 },
  });
  return toArray(data.data)
    .filter((t) => OPEN_TOURNAMENT_STATUSES.includes(t.status))
    .map((t) => ({
      value: t.tournamentId,
      label: t.location ? `${t.name} — ${t.location}` : t.name,
      status: t.status,
      registrationOpenAt: t.registrationOpenAt,
      registrationCloseAt: t.registrationCloseAt,
    }));
}

/**
 * Why a tournament cannot be registered for right now.
 *
 * <p>Mirrors the backend guards in RegistrationServiceImpl exactly, so the form and the server
 * cannot disagree. The status filter alone used to be the whole client-side rule, which is why the
 * dropdown offered tournaments whose registration window opens next month and the submit then 400'd.
 */
export function registrationAvailability(t, openRaceCount, now = new Date()) {
  if (!t) return { ok: true };
  if (!OPEN_TOURNAMENT_STATUSES.includes(t.status)) {
    return { ok: false, reason: "NOT_ACCEPTING" };
  }
  // Null bounds mean unbounded on that side — same as the backend.
  if (t.registrationOpenAt && now < new Date(t.registrationOpenAt)) {
    return { ok: false, reason: "WINDOW_NOT_OPEN", at: t.registrationOpenAt };
  }
  if (t.registrationCloseAt && now > new Date(t.registrationCloseAt)) {
    return { ok: false, reason: "WINDOW_CLOSED", at: t.registrationCloseAt };
  }
  // FE-only: the entry fee lives on the race, so a race must be picked to know what is charged.
  if (openRaceCount === 0) return { ok: false, reason: "NO_OPEN_RACES" };
  return { ok: true };
}

// Races open for entries within a tournament — only OPEN races accept registrations.
const OPEN_RACE_STATUSES = ["OPEN"];

export async function fetchOpenRaces(tournamentId) {
  const { data } = await apiClient.get("/races", {
    params: { tournamentId, size: 100 },
  });
  return (
    toArray(data.data)
      .filter((r) => OPEN_RACE_STATUSES.includes(r.status))
      // entryFee was already on the wire — the old mapper simply dropped it, which is why the owner
      // was never told what entering would cost.
      .map((r) => ({
        value: r.raceId,
        label: r.name ?? r.raceCode,
        entryFee: r.entryFee,
      }))
  );
}

export async function fetchOwnerHorseOptions() {
  const { data } = await apiClient.get("/owner/horses");
  return toArray(data.data).map((h) => ({ value: h.horseId, label: h.name }));
}
