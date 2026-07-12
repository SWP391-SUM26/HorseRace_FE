import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function toPage(d) {
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0, total: d.length };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
    total: d?.totalElements ?? (d?.content?.length ?? 0)
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
  return data.data;
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
  const d = data.data;
  const list = Array.isArray(d) ? d : d?.content ?? [];
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
export {
  approveRegistration,
  assignReferee,
  cancelRace,
  changeUserRole,
  changeUserStatus,
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
  finishRace,
  humanize,
  inviteTournamentReferee,
  provisionUser,
  publishTournament,
  reassignReferee,
  rejectRegistration,
  removeAssignment,
  revokeTournamentAssignment,
  scheduleRace,
  startRace,
  updateRace,
  updateTournament,
  updateUser,
  uploadTournamentImage
};
