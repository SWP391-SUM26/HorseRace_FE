import { apiClient } from "@/common/lib/apiClient";
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
function toPage(d) {
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0, total: d.length };
  const nested = d?.data && typeof d.data === "object" && !Array.isArray(d.data) ? d.data : null;
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
    totalPages: pageData?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, size))),
    page: pageData?.number ?? pageData?.page ?? pageData?.currentPage ?? 0,
    total
  };
}
function humanize(value) {
  if (!value) return "\u2014";
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
async function fetchRegistrations(query) {
  const { data } = await apiClient.get("/registrations", { params: { size: 10, ...query } });
  return toPage(data.data);
}
async function fetchRegistrationStats() {
  const { data } = await apiClient.get("/registrations/stats");
  return data.data;
}
async function approveRegistration(id) {
  await apiClient.patch(`/registrations/${id}/approve`);
}
async function rejectRegistration(id, reason) {
  await apiClient.patch(`/registrations/${id}/reject`, { reason });
}
async function fetchUsers() {
  const { data } = await apiClient.get("/users");
  return toArray(data.data);
}
async function fetchUser(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data.data;
}
async function fetchUserStats() {
  const { data } = await apiClient.get("/users/stats");
  return data.data;
}
async function fetchUserHorses(ownerUserId) {
  const { data } = await apiClient.get("/horses", {
    params: { ownerUserId, size: 100 }
  });
  return toArray(data.data);
}
async function fetchUserWins(userId) {
  const { data } = await apiClient.get(`/users/${userId}/wins`);
  return toArray(data.data);
}
async function fetchHorse(id) {
  const { data } = await apiClient.get(`/horses/${id}`);
  return data.data;
}
async function fetchHorses(query) {
  const { data } = await apiClient.get("/horses", { params: { size: 10, ...query } });
  return toPage(data.data);
}
async function fetchHorseMedical(id) {
  const { data } = await apiClient.get(`/horses/${id}/medical-status`);
  return data.data;
}
async function fetchAdminJockeys(query) {
  const { q, status, sortBy, sortDir, page = 0, size = 10 } = query;
  if (q || status) {
    const { data: data2 } = await apiClient.get("/jockeys/filter", {
      params: { fullName: q || void 0, status: status || void 0, sortBy, sortDir }
    });
    return toPage(data2.data);
  }
  const { data } = await apiClient.get("/jockeys/page", {
    params: { page, size, sortBy: sortBy ?? "winCount", sortDir: sortDir ?? "desc" }
  });
  return toPage(data.data);
}
async function fetchAdminJockey(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return {
    ...data.data,
    jockeyLicenseUrl: data.data.jockeyLicenseUrl ?? null,
    fitnessCertificateUrl: data.data.fitnessCertificateUrl ?? null
  };
}
async function approveJockey(id) {
  await apiClient.patch(`/jockeys/${id}/approve`);
}
async function rejectJockey(id, reason) {
  await apiClient.patch(`/jockeys/${id}/reject`, { reason });
}
async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`);
}
async function updateUser(id, body) {
  await apiClient.put(`/users/${id}`, body);
}
async function changeUserRole(id, roleCode) {
  await apiClient.patch(`/users/${id}/role`, { roleCode });
}
async function changeUserStatus(id, status, reason) {
  await apiClient.patch(`/users/${id}/status`, { status, reason });
}
async function provisionUser(body) {
  await apiClient.post("/users", body);
}
async function fetchTournaments(query) {
  const { data } = await apiClient.get("/tournaments", { params: { size: 50, ...query } });
  return toPage(data.data);
}
async function fetchTournament(id) {
  const { data } = await apiClient.get(`/tournaments/${id}`);
  return data.data;
}
async function createTournament(body) {
  const { data } = await apiClient.post("/tournaments", body);
  return data.data;
}
async function updateTournament(id, body) {
  await apiClient.put(`/tournaments/${id}`, body);
}
async function uploadTournamentImage(id, file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/tournaments/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}
async function publishTournament(id) {
  await apiClient.patch(`/tournaments/${id}/publish`);
}
async function openTournamentRegistration(id) {
  await apiClient.patch(`/tournaments/${id}/open-registration`);
}
async function closeTournamentRegistration(id) {
  await apiClient.patch(`/tournaments/${id}/close-registration`);
}
async function startTournament(id) {
  await apiClient.patch(`/tournaments/${id}/start`);
}
async function completeTournament(id) {
  await apiClient.patch(`/tournaments/${id}/complete`);
}
async function deleteTournament(id) {
  await apiClient.delete(`/tournaments/${id}`);
}
async function fetchRaces(query) {
  const { data } = await apiClient.get("/races", { params: { size: 10, ...query } });
  return toPage(data.data);
}
async function fetchRace(id) {
  const { data } = await apiClient.get(`/races/${id}`);
  return data.data;
}
async function fetchRaceEntries(raceId) {
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
    odds: e.odds ?? null
  }));
}
async function fetchRaceStats(tournamentId) {
  const { data } = await apiClient.get("/races/stats", {
    params: tournamentId ? { tournamentId } : void 0
  });
  return data.data;
}
async function createRace(body) {
  const { data } = await apiClient.post("/races", body);
  return data.data;
}
async function updateRace(id, body) {
  await apiClient.put(`/races/${id}`, body);
}
async function deleteRace(id) {
  await apiClient.delete(`/races/${id}`);
}
async function scheduleRace(id, scheduledStartAt) {
  await apiClient.patch(`/races/${id}/schedule`, { scheduledStartAt });
}
async function startRace(id) {
  await apiClient.patch(`/races/${id}/start`);
}
async function finishRace(id) {
  await apiClient.patch(`/races/${id}/finish`);
}
async function cancelRace(id) {
  await apiClient.patch(`/races/${id}/cancel`);
}
async function fetchStaffingDashboard() {
  const { data } = await apiClient.get("/staffing/dashboard");
  return data.data;
}
async function fetchAssignments(query) {
  const { data } = await apiClient.get("/staffing/assignments", { params: { size: 10, ...query } });
  return toPage(data.data);
}
async function fetchRacePanel(raceId) {
  const { data } = await apiClient.get(
    `/staffing/races/${raceId}/assignments`
  );
  return toArray(data.data);
}
async function fetchStaff() {
  const { data } = await apiClient.get("/staffing/staff", {
    params: { size: 100 }
  });
  return toArray(data.data);
}
async function fetchRefereeConflicts(raceId) {
  const { data } = await apiClient.get(`/staffing/races/${raceId}/referee-conflicts`);
  return data.data ?? [];
}
async function assignReferee(body) {
  await apiClient.post("/staffing/assignments", body);
}
async function reassignReferee(assignmentId, newRefereeUserId, panelRole) {
  await apiClient.put(`/staffing/assignments/${assignmentId}`, { newRefereeUserId, panelRole });
}
async function removeAssignment(assignmentId) {
  await apiClient.delete(`/staffing/assignments/${assignmentId}`);
}
async function fetchWithdrawals(query = {}) {
  const { data } = await apiClient.get("/admin/withdrawals", { params: { size: 10, ...query } });
  return toPage(data.data);
}
async function approveWithdrawal(id) {
  await apiClient.patch(`/admin/withdrawals/${id}/approve`);
}
async function rejectWithdrawal(id) {
  await apiClient.patch(`/admin/withdrawals/${id}/reject`);
}
async function fetchTournamentAssignments(tournamentId) {
  const { data } = await apiClient.get(
    "/staffing/tournament-assignments",
    { params: { tournamentId } }
  );
  return toArray(data.data);
}
async function inviteTournamentReferee(body) {
  await apiClient.post("/staffing/tournament-assignments", body);
}
async function revokeTournamentAssignment(id) {
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

export {
  approveJockey,
  approveRegistration,
  approveWithdrawal,
  assignReferee,
  cancelRace,
  changeUserRole,
  changeUserStatus,
  closeTournamentRegistration,
  completeTournament,
  createRace,
  createTournament,
  deleteRace,
  deleteTournament,
  deleteUser,
  fetchAdminJockey,
  fetchAdminJockeys,
  fetchAssignments,
  fetchHorse,
  fetchHorseMedical,
  fetchHorses,
  fetchRace,
  fetchRaceEntries,
  fetchRacePanel,
  fetchRaceStats,
  fetchRaces,
  fetchRefereeConflicts,
  fetchRegistrationStats,
  fetchRegistrations,
  fetchStaff,
  fetchStaffingDashboard,
  fetchTournament,
  fetchTournamentAssignments,
  fetchTournaments,
  fetchUser,
  fetchUserHorses,
  fetchUserStats,
  fetchUserWins,
  fetchUsers,
  fetchWithdrawals,
  finishRace,
  humanize,
  inviteTournamentReferee,
  openTournamentRegistration,
  provisionUser,
  publishTournament,
  reassignReferee,
  rejectJockey,
  rejectRegistration,
  rejectWithdrawal,
  removeAssignment,
  revokeTournamentAssignment,
  scheduleRace,
  startRace,
  startTournament,
  updateRace,
  updateTournament,
  updateUser,
  uploadTournamentImage
};
