import { apiClient } from "@/common/lib/apiClient";

/** "ACTIVE" -> "Active", "GRADE_1" -> "Grade 1". */
function titleCase(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mapHorse(h) {
  return {
    id: h.horseId,
    registrationId: h.registrationCode,
    name: h.name,
    status: titleCase(h.status),
    earnings: h.earnings,
  };
}

function mapRace(r) {
  return {
    id: r.raceId,
    name: r.name,
    course: r.venue,
    date: r.date,
    yourHorse: r.yourHorse,
    entryStatus: titleCase(r.entryStatus),
  };
}

/** GET /api/v1/owner/overview. */
export async function fetchOwnerOverview() {
  const { data } = await apiClient.get("/owner/overview");
  const raw = data.data;
  // Collapse exact-duplicate upcoming-race rows (same race + same horse).
  const seen = new Set();
  const upcomingRaces = raw.upcomingRaces.map(mapRace).filter((r) => {
    const key = `${r.id}|${r.yourHorse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    kpis: raw.kpis,
    horses: raw.horses.map(mapHorse),
    upcomingRaces,
  };
}

// ---------- Owner / horse documents (CN2 document review) ----------
/** Upload a document scoped to the signed-in owner (auto-scoped by the BE). */
export async function uploadOwnerDocument(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerType", "OWNER");
  const { data } = await apiClient.post("/owner/documents", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

/** Upload a document for one of the owner's horses. */
export async function uploadHorseDocument(horseId, file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerType", "HORSE");
  form.append("horseId", horseId);
  const { data } = await apiClient.post("/owner/documents", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

/** List the owner's own documents. */
export async function fetchOwnerDocuments() {
  // Owner/horse docs are RESTRICTED — listed via the ownership-checked owner
  // endpoint, not /attachments.
  const { data } = await apiClient.get("/owner/documents");
  return data.data ?? [];
}

/** List the documents attached to one of the owner's horses (ownership-checked). */
export async function fetchHorseDocuments(horseId) {
  const { data } = await apiClient.get(
    `/owner/documents/horse/${horseId}`,
  );
  return data.data ?? [];
}

// ---------- Confirm participation (FR-10) — readiness for the owner's entry ----------
/**
 * GET /registrations scoped to ONE owner + race.
 * ⚠️ SECURITY: this endpoint has NO server-side owner scoping (client-supplied
 * `ownerUserId`, no @PreAuthorize). We MUST pass the caller's own `ownerUserId`
 * on every call, otherwise the response would surface other owners'
 * registrations (data-exposure). Never call it unscoped.
 */
export async function fetchOwnerRaceRegistrations(params) {
  const { data } = await apiClient.get("/registrations", {
    params: {
      ownerUserId: params.ownerUserId,
      raceId: params.raceId,
      size: 100,
    },
  });
  const d = data.data;
  return Array.isArray(d) ? d : (d?.content ?? []);
}

/**
 * PATCH /races/{raceId}/entries/{entryId}/confirm — owner confirms this horse
 * will run (ENTERED → CHECKED_IN). Idempotent server-side, so a double click or
 * a refresh is safe. Keyed on the entry because an owner may run several horses
 * in the same race.
 */
export async function confirmParticipation(params) {
  await apiClient.patch(
    `/races/${params.raceId}/entries/${params.entryId}/confirm`,
  );
}

/**
 * Real horse ranking from GET /standings/horses — placings from OFFICIAL race
 * results and prize money from race_entry.prize_earned. The endpoint existed and
 * worked but had no caller, so the horse table was the one league table the app
 * never showed.
 *
 * Note: the BE shares one league-table DTO across jockeys/horses/predictors, so
 * each row's subject id is called `jockeyUserId` whatever the table. Here it is
 * the horseId.
 */
export async function fetchHorseStandings(limit = 10) {
  const { data } = await apiClient.get("/standings/horses", {
    params: { limit },
  });
  const d = data.data;
  return Array.isArray(d) ? d : (d?.content ?? []);
}
