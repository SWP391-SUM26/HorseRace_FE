import { apiClient } from "@/common/lib/apiClient";

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "WHIP_USAGE" -> "Whip Usage". */
export function humanize(value) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- Dashboard ----------
export async function fetchRefereeDashboard() {
  const { data } = await apiClient.get("/referee/dashboard");
  return data.data;
}

// ---------- Races (scoped to the referee's assigned races) ----------
/** Race IDs the signed-in referee is assigned (by admin) to officiate. */
export async function fetchRefereeRaceIds() {
  const { data } = await apiClient.get("/staffing/my-races");
  return data.data ?? [];
}

/** The signed-in referee's own assignments incl. the per-race code the admin issued. */

/** CN1: the referee's own per-race assignments they can accept/decline. */
export async function fetchMyRaceAssignments() {
  const { data } = await apiClient.get("/referee/race-assignments");
  return toArray(data.data);
}
export async function acceptRaceAssignment(id) {
  await apiClient.patch(`/referee/race-assignments/${id}/accept`);
}
export async function declineRaceAssignment(id, reason) {
  await apiClient.patch(`/referee/race-assignments/${id}/decline`, { reason });
}
export async function fetchMyAssignments() {
  const { data } = await apiClient.get("/staffing/my-assignments");
  return toArray(data.data).map((a) => ({
    refAssignmentId: a.refAssignmentId,
    raceId: a.raceId,
    raceName: a.raceName ?? null,
    raceCode: a.raceCode ?? null,
    panelRole: a.panelRole ?? null,
    refCode: a.refCode ?? null,
    status: a.status ?? null,
  }));
}

/** A tournament-level invitation the admin sent this referee. */
export async function fetchMyTournamentInvitations() {
  const { data } = await apiClient.get("/referee/invitations");
  return toArray(data.data);
}
export async function acceptTournamentInvitation(id) {
  await apiClient.patch(`/referee/invitations/${id}/accept`);
}
export async function rejectTournamentInvitation(id) {
  await apiClient.patch(`/referee/invitations/${id}/reject`);
}

export async function fetchRefereeRaces() {
  const [racesRes, ids] = await Promise.all([
    apiClient.get("/races", {
      params: { size: 200, sortBy: "scheduledStartAt", sortDir: "desc" },
    }),
    fetchRefereeRaceIds(),
  ]);
  const assigned = new Set(ids);
  return toArray(racesRes.data.data)
    .filter((r) => assigned.has(r.raceId)) // only races an admin assigned to this referee
    .map((r) => ({
      raceId: r.raceId,
      raceCode: r.raceCode ?? null,
      name: r.name,
      scheduledStartAt: r.scheduledStartAt ?? null,
      status: r.status,
      trackCondition: r.trackCondition ?? null,
    }));
}

/** A single race with the extra fields the live monitor header shows. */

/**
 * GET /races/{id} — fetch one race directly. The scoped race list (`fetchRefereeRaces`) is capped,
 * so a deep-linked race outside that window still resolves through this single-race fetch.
 */
export async function fetchRefereeRace(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}`);
  const r = data.data;
  return {
    raceId: r.raceId,
    raceCode: r.raceCode ?? null,
    name: r.name,
    scheduledStartAt: r.scheduledStartAt ?? null,
    status: r.status,
    trackCondition: r.trackCondition ?? null,
    raceType: r.raceType ?? null,
    distanceMeter: r.distanceMeter ?? null,
    tournamentName: r.tournamentName ?? null,
  };
}

// ---------- Document review (CN2) ----------
/** GET /races/{raceId}/entry-reviews — one row per runner with its owner + horse docs. */
export async function fetchEntryReviews(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entry-reviews`);
  return toArray(data.data);
}

/** PATCH /races/{raceId}/entries/{entryId}/accept — clear the entry's documents. */
export async function acceptEntry(raceId, entryId) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/entries/${entryId}/accept`,
  );
  return data.data;
}

/** PATCH /races/{raceId}/entries/{entryId}/reject — reject with a required reason. */
export async function rejectEntry(raceId, entryId, reason) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/entries/${entryId}/reject`,
    { reason },
  );
  return data.data;
}

// ---------- Pre-Race Inspection ----------
export async function fetchInspections(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/inspections`);
  return toArray(data.data);
}

export async function recordInspection(raceId, body) {
  await apiClient.post(`/races/${raceId}/inspections`, body);
}

export async function submitAllInspections(raceId) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/inspections/submit-all`,
    { confirm: true },
  );
  return data.data;
}

// ---------- Violations ----------
export async function fetchRaceViolations(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/violations`);
  return toArray(data.data);
}

export async function fetchViolation(violationId) {
  const { data } = await apiClient.get(`/violations/${violationId}`);
  return data.data;
}

export async function createViolation(raceId, body) {
  const { data } = await apiClient.post(`/races/${raceId}/violations`, body);
  return data.data;
}

export async function recordRuling(violationId, body) {
  await apiClient.patch(`/violations/${violationId}/ruling`, body);
}

export async function updateViolation(violationId, body) {
  await apiClient.put(`/violations/${violationId}`, body);
}

export async function deleteViolation(violationId) {
  await apiClient.delete(`/violations/${violationId}`);
}

/** Race entries (runners) for the violation entry picker. */
export async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({
    entryId: e.entryId,
    entryNo: e.entryNo ?? null,
    horseName: e.horseName,
  }));
}

// ---------- Results ----------
export async function fetchResults(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data.data;
}

/** ADMIN-ONLY legacy path — records provisional results directly (no OTP, no refCode). */
export async function recordResults(raceId, results) {
  const { data } = await apiClient.post(`/races/${raceId}/results`, {
    results,
  });
  return data.data;
}

/** CN3: email a fresh 6-digit OTP to the referee's verified address for this race. */
export async function requestRefereeCode(raceId) {
  await apiClient.post(`/races/${raceId}/referee-code/request`);
}

/** CN3: publish the combined race report (results + violations), authorised by the emailed OTP. */
export async function submitReport(raceId, body) {
  const { data } = await apiClient.post(`/races/${raceId}/report`, body);
  return data.data;
}

/** CN3: flag one result row UNDER_REVIEW (referee/admin), pre-certification. */
export async function flagInquiry(raceId, resultId) {
  await apiClient.patch(`/races/${raceId}/results/${resultId}/inquiry`);
}

/** Delete one provisional result row (ADMIN-ONLY; blocked once OFFICIAL). */
export async function deleteResult(raceId, resultId) {
  await apiClient.delete(`/races/${raceId}/results/${resultId}`);
}

/** Upload an image and get back its public URL + id (for violation footage etc.). */
export async function uploadAttachment(file, ownerEntityType, ownerEntityId) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerEntityType", ownerEntityType);
  if (ownerEntityId) form.append("ownerEntityId", ownerEntityId);
  const { data } = await apiClient.post("/attachments", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function certifyResults(raceId, body) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/results/certify`,
    body,
  );
  return data.data;
}

// ---------- Live monitor ----------
export async function fetchLiveRace(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/live`);
  return data.data;
}

// ---------- Registration management ----------

export async function fetchRegistrations(query) {
  const { data } = await apiClient.get("/registrations", {
    params: { size: 10, ...query },
  });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
  };
}

export async function fetchRegistrationStats() {
  const { data } = await apiClient.get("/registrations/stats");
  return data.data;
}

export async function approveRegistration(id) {
  await apiClient.patch(`/registrations/${id}/approve`);
}

export async function rejectRegistration(id, reason) {
  await apiClient.patch(`/registrations/${id}/reject`, { reason });
}

/** DELETE /registrations/{id} — referee/admin soft-remove (sets status REMOVED). */
export async function deleteRegistration(id) {
  await apiClient.delete(`/registrations/${id}`);
}

/** Digital Passport for the Pre-Race Inspection panel (from /horses/{id} + pedigree). */
export async function fetchHorsePassport(horseId) {
  const [horse, pedigree] = await Promise.all([
    apiClient
      .get(`/horses/${horseId}`)
      .then((r) => r.data.data)
      .catch(() => ({})),
    apiClient
      .get(`/horses/${horseId}/pedigree`)
      .then((r) => r.data.data)
      .catch(() => ({})),
  ]);
  /** Pedigree may return trainer as a string OR an object {name, licenseNo}. */
  const trainerName = (t) => (typeof t === "string" ? t : (t?.name ?? null));
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob
    ? Math.max(0, new Date().getUTCFullYear() - dob.getUTCFullYear())
    : null;
  const g = (horse?.gender ?? "").toUpperCase();
  const genderWord =
    g === "MALE"
      ? "Colt"
      : g === "FEMALE"
        ? "Filly"
        : g === "GELDING"
          ? "Gelding"
          : g
            ? humanize(g)
            : "—";
  return {
    horseId,
    name: horse?.name ?? "—",
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    trainer:
      trainerName(pedigree?.trainer) ??
      trainerName(pedigree?.trainerName) ??
      trainerName(horse?.trainerName) ??
      null,
    owner: horse?.ownerName ?? null,
  };
}

/** Assemble the Horse Verification panel from /horses/{id} (+pedigree, +medical-status). */
export async function fetchHorseVerification(horseId) {
  const [horse, pedigree, medical] = await Promise.all([
    apiClient
      .get(`/horses/${horseId}`)
      .then((r) => r.data.data)
      .catch(() => ({})),
    apiClient
      .get(`/horses/${horseId}/pedigree`)
      .then((r) => r.data.data)
      .catch(() => ({})),
    apiClient
      .get(`/horses/${horseId}/medical-status`)
      .then((r) => r.data.data)
      .catch(() => ({})),
  ]);
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob
    ? Math.max(0, new Date().getUTCFullYear() - dob.getUTCFullYear())
    : null;
  const g = (horse?.gender ?? "").toUpperCase();
  const genderWord =
    g === "MALE"
      ? "Stallion"
      : g === "FEMALE"
        ? "Mare"
        : g === "GELDING"
          ? "Gelding"
          : g
            ? humanize(g)
            : "—";
  return {
    horseId,
    name: horse?.name ?? horse?.fullName ?? "—",
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    breed: horse?.breed ?? null,
    sireName: pedigree?.sireName ?? null,
    damName: pedigree?.damName ?? null,
    vaccinationsUpToDate: medical?.vaccinationsUpToDate ?? null,
    fitnessCertified: horse?.fitnessCertified ?? null,
    passportScanStatus: horse?.passportScanStatus ?? null,
    healthStatus: medical?.healthStatus ?? null,
  };
}

// ---------- Referee — Applicant onboarding (Registration Approval) ----------
// NOTE: SPEC-ONLY endpoints (docs/be-referee-onboarding-contracts-todo.md). They 404 until the BE
// ships them; the onboarding hooks use retry:false so the UI falls to empty/error states quickly.

export async function fetchApplications(query) {
  const { data } = await apiClient.get("/referee/applications", {
    params: { size: 20, ...query },
  });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
  };
}

export async function fetchApplicationStats() {
  const { data } = await apiClient.get("/referee/applications/stats");
  return data.data;
}

export async function fetchApplication(id) {
  const { data } = await apiClient.get(`/referee/applications/${id}`);
  return data.data;
}

export async function approveApplication(id) {
  await apiClient.patch(`/referee/applications/${id}/approve`);
}

export async function rejectApplication(id, reason) {
  await apiClient.patch(`/referee/applications/${id}/reject`, { reason });
}

export async function requestApplicationInfo(id, note) {
  await apiClient.patch(`/referee/applications/${id}/request-info`, { note });
}
