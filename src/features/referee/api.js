import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function humanize(value) {
  if (!value) return "\u2014";
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
async function fetchRefereeDashboard() {
  const { data } = await apiClient.get("/referee/dashboard");
  return data.data;
}
async function fetchRefereeRaceIds() {
  const { data } = await apiClient.get("/staffing/my-races");
  return data.data ?? [];
}
async function fetchMyRaceAssignments() {
  const { data } = await apiClient.get("/referee/race-assignments");
  return toArray(data.data);
}
async function acceptRaceAssignment(id) {
  await apiClient.patch(`/referee/race-assignments/${id}/accept`);
}
async function declineRaceAssignment(id, reason) {
  await apiClient.patch(`/referee/race-assignments/${id}/decline`, { reason });
}
async function fetchMyAssignments() {
  const { data } = await apiClient.get("/staffing/my-assignments");
  return toArray(data.data).map((a) => ({
    refAssignmentId: a.refAssignmentId,
    raceId: a.raceId,
    raceName: a.raceName ?? null,
    raceCode: a.raceCode ?? null,
    panelRole: a.panelRole ?? null,
    refCode: a.refCode ?? null,
    status: a.status ?? null
  }));
}
async function fetchMyTournamentInvitations() {
  const { data } = await apiClient.get("/referee/invitations");
  return toArray(data.data);
}
async function acceptTournamentInvitation(id) {
  await apiClient.patch(`/referee/invitations/${id}/accept`);
}
async function rejectTournamentInvitation(id) {
  await apiClient.patch(`/referee/invitations/${id}/reject`);
}
async function fetchRefereeRaces() {
  const [racesRes, ids] = await Promise.all([
    apiClient.get("/races", {
      params: { size: 200, sortBy: "scheduledStartAt", sortDir: "desc" }
    }),
    fetchRefereeRaceIds()
  ]);
  const assigned = new Set(ids);
  return toArray(racesRes.data.data).filter((r) => assigned.has(r.raceId)).map((r) => ({
    raceId: r.raceId,
    raceCode: r.raceCode ?? null,
    name: r.name,
    scheduledStartAt: r.scheduledStartAt ?? null,
    status: r.status,
    trackCondition: r.trackCondition ?? null
  }));
}
async function fetchRefereeRace(raceId) {
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
    tournamentName: r.tournamentName ?? null
  };
}
async function fetchEntryReviews(raceId) {
  const { data } = await apiClient.get(
    `/races/${raceId}/entry-reviews`
  );
  return toArray(data.data);
}
async function acceptEntry(raceId, entryId) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/entries/${entryId}/accept`
  );
  return data.data;
}
async function rejectEntry(raceId, entryId, reason) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/entries/${entryId}/reject`,
    { reason }
  );
  return data.data;
}
async function fetchInspections(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/inspections`);
  return toArray(data.data);
}
async function recordInspection(raceId, body) {
  await apiClient.post(`/races/${raceId}/inspections`, body);
}
async function submitAllInspections(raceId) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/inspections/submit-all`,
    { confirm: true }
  );
  return data.data;
}
async function fetchRaceViolations(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/violations`);
  return toArray(data.data);
}
async function fetchViolation(violationId) {
  const { data } = await apiClient.get(`/violations/${violationId}`);
  return data.data;
}
async function createViolation(raceId, body) {
  const { data } = await apiClient.post(
    `/races/${raceId}/violations`,
    body
  );
  return data.data;
}
async function recordRuling(violationId, body) {
  await apiClient.patch(`/violations/${violationId}/ruling`, body);
}
async function updateViolation(violationId, body) {
  await apiClient.put(`/violations/${violationId}`, body);
}
async function deleteViolation(violationId) {
  await apiClient.delete(`/violations/${violationId}`);
}
async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({ entryId: e.entryId, entryNo: e.entryNo ?? null, horseName: e.horseName }));
}
async function fetchResults(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data.data;
}
async function recordResults(raceId, results) {
  const { data } = await apiClient.post(`/races/${raceId}/results`, {
    results
  });
  return data.data;
}
async function requestRefereeCode(raceId) {
  await apiClient.post(`/races/${raceId}/referee-code/request`);
}
async function submitReport(raceId, body) {
  const { data } = await apiClient.post(
    `/races/${raceId}/report`,
    body
  );
  return data.data;
}
async function flagInquiry(raceId, resultId) {
  await apiClient.patch(`/races/${raceId}/results/${resultId}/inquiry`);
}
async function deleteResult(raceId, resultId) {
  await apiClient.delete(`/races/${raceId}/results/${resultId}`);
}
async function uploadAttachment(file, ownerEntityType, ownerEntityId) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerEntityType", ownerEntityType);
  if (ownerEntityId) form.append("ownerEntityId", ownerEntityId);
  const { data } = await apiClient.post("/attachments", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}
async function certifyResults(raceId, body) {
  const { data } = await apiClient.patch(
    `/races/${raceId}/results/certify`,
    body
  );
  return data.data;
}
async function fetchLiveRace(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/live`);
  return data.data;
}
async function fetchRegistrations(query) {
  const { data } = await apiClient.get("/registrations", { params: { size: 10, ...query } });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return { rows: d?.content ?? [], totalPages: d?.totalPages ?? 1, page: d?.number ?? 0 };
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
async function deleteRegistration(id) {
  await apiClient.delete(`/registrations/${id}`);
}
async function fetchHorsePassport(horseId) {
  const [horse, pedigree] = await Promise.all([
    apiClient.get(`/horses/${horseId}`).then((r) => r.data.data).catch(() => ({})),
    apiClient.get(`/horses/${horseId}/pedigree`).then((r) => r.data.data).catch(() => ({}))
  ]);
  const trainerName = (t) => typeof t === "string" ? t : t?.name ?? null;
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob ? Math.max(0, (/* @__PURE__ */ new Date()).getUTCFullYear() - dob.getUTCFullYear()) : null;
  const g = (horse?.gender ?? "").toUpperCase();
  const genderWord = g === "MALE" ? "Colt" : g === "FEMALE" ? "Filly" : g === "GELDING" ? "Gelding" : g ? humanize(g) : "\u2014";
  return {
    horseId,
    name: horse?.name ?? "\u2014",
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    trainer: trainerName(pedigree?.trainer) ?? trainerName(pedigree?.trainerName) ?? trainerName(horse?.trainerName) ?? null,
    owner: horse?.ownerName ?? null
  };
}
async function fetchHorseVerification(horseId) {
  const [horse, pedigree, medical] = await Promise.all([
    apiClient.get(`/horses/${horseId}`).then((r) => r.data.data).catch(() => ({})),
    apiClient.get(`/horses/${horseId}/pedigree`).then((r) => r.data.data).catch(() => ({})),
    apiClient.get(`/horses/${horseId}/medical-status`).then((r) => r.data.data).catch(() => ({}))
  ]);
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob ? Math.max(0, (/* @__PURE__ */ new Date()).getUTCFullYear() - dob.getUTCFullYear()) : null;
  const g = (horse?.gender ?? "").toUpperCase();
  const genderWord = g === "MALE" ? "Stallion" : g === "FEMALE" ? "Mare" : g === "GELDING" ? "Gelding" : g ? humanize(g) : "\u2014";
  return {
    horseId,
    name: horse?.name ?? horse?.fullName ?? "\u2014",
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    breed: horse?.breed ?? null,
    sireName: pedigree?.sireName ?? null,
    damName: pedigree?.damName ?? null,
    vaccinationsUpToDate: medical?.vaccinationsUpToDate ?? null,
    fitnessCertified: horse?.fitnessCertified ?? null,
    passportScanStatus: horse?.passportScanStatus ?? null,
    healthStatus: medical?.healthStatus ?? null
  };
}
async function fetchApplications(query) {
  const { data } = await apiClient.get("/referee/applications", { params: { size: 20, ...query } });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return { rows: d?.content ?? [], totalPages: d?.totalPages ?? 1, page: d?.number ?? 0 };
}
async function fetchApplicationStats() {
  const { data } = await apiClient.get("/referee/applications/stats");
  return data.data;
}
async function fetchApplication(id) {
  const { data } = await apiClient.get(`/referee/applications/${id}`);
  return data.data;
}
async function approveApplication(id) {
  await apiClient.patch(`/referee/applications/${id}/approve`);
}
async function rejectApplication(id, reason) {
  await apiClient.patch(`/referee/applications/${id}/reject`, { reason });
}
async function requestApplicationInfo(id, note) {
  await apiClient.patch(`/referee/applications/${id}/request-info`, { note });
}
export {
  acceptEntry,
  acceptRaceAssignment,
  acceptTournamentInvitation,
  approveApplication,
  approveRegistration,
  certifyResults,
  createViolation,
  declineRaceAssignment,
  deleteRegistration,
  deleteResult,
  deleteViolation,
  fetchApplication,
  fetchApplicationStats,
  fetchApplications,
  fetchEntryReviews,
  fetchHorsePassport,
  fetchHorseVerification,
  fetchInspections,
  fetchLiveRace,
  fetchMyAssignments,
  fetchMyRaceAssignments,
  fetchMyTournamentInvitations,
  fetchRaceEntries,
  fetchRaceViolations,
  fetchRefereeDashboard,
  fetchRefereeRace,
  fetchRefereeRaceIds,
  fetchRefereeRaces,
  fetchRegistrationStats,
  fetchRegistrations,
  fetchResults,
  fetchViolation,
  flagInquiry,
  humanize,
  recordInspection,
  recordResults,
  recordRuling,
  rejectApplication,
  rejectEntry,
  rejectRegistration,
  rejectTournamentInvitation,
  requestApplicationInfo,
  requestRefereeCode,
  submitAllInspections,
  submitReport,
  updateViolation,
  uploadAttachment
};
