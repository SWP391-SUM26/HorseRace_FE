import { apiClient } from "@/common/lib/apiClient";

/**
 * Unwrap a list payload into a plain array.
 *
 * The BE is inconsistent about the envelope it uses, so probe every wrapper key
 * we have seen in the wild and recurse once into a nested `data` object.
 */
function toArray(d) {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];

  const keys = ["content", "items", "records", "rows", "data", "list"];
  for (const key of keys) {
    if (Array.isArray(d[key])) return d[key];
  }

  if (d.data && typeof d.data === "object") return toArray(d.data);
  return [];
}

/**
 * Unwrap a paginated payload into a consistent shape.
 *
 * Tolerates a bare array, a Spring `Page`, and the various hand-rolled paging
 * envelopes: `total` is read from whichever count field is present, and
 * `totalPages` is derived from total/size when the server omits it.
 */
function toPage(d) {
  if (Array.isArray(d))
    return { rows: d, totalPages: 1, page: 0, total: d.length };

  const nested =
    d?.data && typeof d.data === "object" && !Array.isArray(d.data)
      ? d.data
      : null;
  const pageData = nested ?? d;
  const rows = toArray(pageData);
  const total =
    pageData?.totalElements ??
    pageData?.totalItems ??
    pageData?.totalRecords ??
    pageData?.total ??
    rows.length;
  const size = pageData?.size ?? pageData?.pageSize ?? rows.length ?? 10;

  return {
    rows,
    totalPages:
      pageData?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, size))),
    page: pageData?.number ?? pageData?.page ?? pageData?.currentPage ?? 0,
    total,
  };
}

/** "GROUP_1" → "Group 1". */
export function humanize(value) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- Registrations (ADMIN approval) ----------
export async function fetchRegistrations(query) {
  const { data } = await apiClient.get("/registrations", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
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

// ---------- Users ----------
// GET /users returns the full list today (no server filter/pagination) — we
// filter client-side.
export async function fetchUsers() {
  const { data } = await apiClient.get("/users");
  return toArray(data.data);
}

export async function fetchUser(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data.data;
}

/**
 * GET /users/stats (ADMIN) — aggregate counts for the dashboard user KPI
 * (NOT a full /users fetch).
 */
export async function fetchUserStats() {
  const { data } = await apiClient.get("/users/stats");
  return data.data;
}

export async function fetchUserHorses(ownerUserId) {
  const { data } = await apiClient.get("/horses", {
    params: { ownerUserId, size: 100 },
  });
  return toArray(data.data);
}

export async function fetchUserWins(userId) {
  const { data } = await apiClient.get(`/users/${userId}/wins`);
  return toArray(data.data);
}

export async function fetchHorse(id) {
  const { data } = await apiClient.get(`/horses/${id}`);
  return data.data;
}

// ---------- Horse management (admin) — GET /horses (Page<HorseResponse>) ----------

/** GET /horses — search + filter + sort + pagination (HorseFilterRequest). */
export async function fetchHorses(query) {
  const { data } = await apiClient.get("/horses", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
}

/** GET /horses/{id}/medical-status — drives the detail panel's medical/vet section. */
export async function fetchHorseMedical(id) {
  const { data } = await apiClient.get(`/horses/${id}/medical-status`);
  return data.data;
}

// ---------- Jockey management (admin) ----------
// These are the admin fetchers, NOT the marketplace wrapper.

/**
 * Paged jockey listing. When a search term or status filter is set we hit
 * `/jockeys/filter` (returns the full matching list → collapsed to one page);
 * otherwise the paged `/jockeys/page`.
 */
export async function fetchAdminJockeys(query) {
  const { q, status, sortBy, sortDir, page = 0, size = 10 } = query;
  if (q || status) {
    const { data: filterData } = await apiClient.get("/jockeys/filter", {
      params: {
        fullName: q || undefined,
        status: status || undefined,
        sortBy,
        sortDir,
      },
    });
    return toPage(filterData.data);
  }
  const { data } = await apiClient.get("/jockeys/page", {
    params: {
      page,
      size,
      sortBy: sortBy ?? "winCount",
      sortDir: sortDir ?? "desc",
    },
  });
  return toPage(data.data);
}

export async function fetchAdminJockey(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return {
    ...data.data,
    jockeyLicenseUrl: data.data.jockeyLicenseUrl ?? null,
    fitnessCertificateUrl: data.data.fitnessCertificateUrl ?? null,
  };
}

/** PATCH /jockeys/{id}/approve (ADMIN) — flips the jockey ACTIVE. */
export async function approveJockey(id) {
  await apiClient.patch(`/jockeys/${id}/approve`);
}

/** PATCH /jockeys/{id}/reject (ADMIN) — `reason` is REQUIRED (BE @NotBlank → 400 on blank). */
export async function rejectJockey(id, reason) {
  await apiClient.patch(`/jockeys/${id}/reject`, { reason });
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`);
}

export async function updateUser(id, body) {
  await apiClient.put(`/users/${id}`, body);
}

// Spec-only (BE doc §B5/B6/B7).
export async function changeUserRole(id, roleCode) {
  await apiClient.patch(`/users/${id}/role`, { roleCode });
}

export async function changeUserStatus(id, status, reason) {
  await apiClient.patch(`/users/${id}/status`, { status, reason });
}

export async function provisionUser(body) {
  await apiClient.post("/users", body);
}

// ---------- Tournaments ----------
export async function fetchTournaments(query) {
  const { data } = await apiClient.get("/tournaments", {
    params: { size: 50, ...query },
  });
  return toPage(data.data);
}

export async function fetchTournament(id) {
  const { data } = await apiClient.get(`/tournaments/${id}`);
  return data.data;
}

export async function createTournament(body) {
  const { data } = await apiClient.post("/tournaments", body);
  return data.data;
}

export async function updateTournament(id, body) {
  await apiClient.put(`/tournaments/${id}`, body);
}

export async function uploadTournamentImage(id, file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/tournaments/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function publishTournament(id) {
  await apiClient.patch(`/tournaments/${id}/publish`);
}

export async function openTournamentRegistration(id) {
  await apiClient.patch(`/tournaments/${id}/open-registration`);
}

export async function closeTournamentRegistration(id) {
  await apiClient.patch(`/tournaments/${id}/close-registration`);
}

export async function startTournament(id) {
  await apiClient.patch(`/tournaments/${id}/start`);
}

export async function completeTournament(id) {
  await apiClient.patch(`/tournaments/${id}/complete`);
}

export async function deleteTournament(id) {
  await apiClient.delete(`/tournaments/${id}`);
}

// ---------- Races ----------
export async function fetchRaces(query) {
  const { data } = await apiClient.get("/races", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
}

export async function fetchRace(id) {
  const { data } = await apiClient.get(`/races/${id}`);
  return data.data;
}

/** Race entries (participants) for the admin race-management view. */
export async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  const list = toArray(data.data);
  return list.map((e) => ({
    entryId: e.entryId,
    entryNo: e.entryNo ?? null,
    entryCode: e.entryCode ?? null,
    laneNo: e.laneNo ?? null,
    drawStall: e.drawStall ?? null,
    status: e.status ?? null,
    horseId: e.horseId ?? null,
    horseName: e.horseName ?? null,
    ownerUserId: e.ownerUserId ?? null,
    ownerName: e.ownerName ?? null,
    jockeyUserId: e.jockeyUserId ?? null,
    jockeyName: e.jockeyName ?? null,
    weightCarriedLbs: e.weightCarriedLbs ?? null,
    recentForm: e.recentForm ?? null,
    odds: e.odds ?? null,
  }));
}

export async function fetchRaceStats(tournamentId) {
  const { data } = await apiClient.get("/races/stats", {
    params: tournamentId ? { tournamentId } : undefined,
  });
  return data.data;
}

export async function createRace(body) {
  const { data } = await apiClient.post("/races", body);
  return data.data;
}

export async function updateRace(id, body) {
  await apiClient.put(`/races/${id}`, body);
}

export async function deleteRace(id) {
  await apiClient.delete(`/races/${id}`);
}

export async function scheduleRace(id, scheduledStartAt) {
  await apiClient.patch(`/races/${id}/schedule`, { scheduledStartAt });
}

/** Conduct the race (OPEN/CLOSED → RUNNING; locks entries). */
export async function startRace(id) {
  await apiClient.patch(`/races/${id}/start`);
}

/** End the race (RUNNING → FINISHED; opens referee reporting). */
export async function finishRace(id) {
  await apiClient.patch(`/races/${id}/finish`);
}

export async function cancelRace(id) {
  await apiClient.patch(`/races/${id}/cancel`);
}

// ---------- Staffing ----------
export async function fetchStaffingDashboard() {
  const { data } = await apiClient.get("/staffing/dashboard");
  return data.data;
}

export async function fetchAssignments(query) {
  const { data } = await apiClient.get("/staffing/assignments", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
}

export async function fetchRacePanel(raceId) {
  const { data } = await apiClient.get(`/staffing/races/${raceId}/assignments`);
  return toArray(data.data);
}

export async function fetchStaff() {
  const { data } = await apiClient.get("/staffing/staff", {
    params: { size: 100 },
  });
  return toArray(data.data);
}

/**
 * Referee ids busy at an overlapping time (±window) with this race — excluded
 * from the picker.
 */
export async function fetchRefereeConflicts(raceId) {
  const { data } = await apiClient.get(
    `/staffing/races/${raceId}/referee-conflicts`,
  );
  return data.data ?? [];
}

export async function assignReferee(body) {
  await apiClient.post("/staffing/assignments", body);
}

export async function reassignReferee(assignmentId, newRefereeUserId, panelRole) {
  await apiClient.put(`/staffing/assignments/${assignmentId}`, {
    newRefereeUserId,
    panelRole,
  });
}

export async function removeAssignment(assignmentId) {
  await apiClient.delete(`/staffing/assignments/${assignmentId}`);
}

// ---------- Withdrawals (ADMIN review) ----------
export async function fetchWithdrawals(query = {}) {
  const { data } = await apiClient.get("/admin/withdrawals", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
}

export async function approveWithdrawal(id) {
  await apiClient.patch(`/admin/withdrawals/${id}/approve`);
}

export async function rejectWithdrawal(id) {
  await apiClient.patch(`/admin/withdrawals/${id}/reject`);
}

// Tournament-level referee invitations — BE: /staffing/tournament-assignments (§E).
export async function fetchTournamentAssignments(tournamentId) {
  const { data } = await apiClient.get("/staffing/tournament-assignments", {
    params: { tournamentId },
  });
  return toArray(data.data);
}

export async function inviteTournamentReferee(body) {
  await apiClient.post("/staffing/tournament-assignments", body);
}

export async function revokeTournamentAssignment(id) {
  await apiClient.delete(`/staffing/tournament-assignments/${id}`);
}

// ---------- Prediction moderation (Req 32) ----------
export async function fetchAdminPredictions(query) {
  const { data } = await apiClient.get("/admin/predictions", {
    params: { size: 10, ...query },
  });
  return toPage(data.data);
}

export async function fetchPredictionStats() {
  const { data } = await apiClient.get("/admin/predictions/stats");
  return data.data;
}

/** Void an unsettled bet; the backend refunds the stake two-sided and notifies
 *  the bettor. */
export async function voidPrediction(id, reason) {
  await apiClient.patch(`/admin/predictions/${id}/void`, { reason });
}

// ---------- Role / permission matrix (Req 26) ----------
export async function fetchRoles() {
  const { data } = await apiClient.get("/roles");
  return toArray(data.data);
}

export async function fetchPermissions() {
  const { data } = await apiClient.get("/permissions");
  return toArray(data.data);
}

/** Replaces the role's whole permission set — the BE rejects unknown codes
 *  outright. */
export async function updateRolePermissions(roleId, permissionCodes) {
  await apiClient.put(`/roles/${roleId}/permissions`, { permissionCodes });
}
