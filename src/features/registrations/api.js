import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function mapRegistration(r) {
  return {
    id: r.registrationId,
    code: r.registrationCode,
    status: r.status,
    tournament: r.tournamentName ?? "\u2014",
    horse: r.horseName,
    horseCode: r.horseCode,
    raceId: r.raceId,
    race: r.raceName,
    submittedAt: r.submittedAt,
    rejectionReason: r.rejectionReason
  };
}
const TERMINAL = ["REJECTED", "WITHDRAWN", "REMOVED"];
function canWithdraw(status) {
  return !TERMINAL.includes(status);
}
async function fetchMyRegistrations(ownerUserId) {
  const { data } = await apiClient.get(
    "/registrations",
    { params: { ownerUserId, size: 100 } }
  );
  return toArray(data.data).map(mapRegistration);
}
async function registerForTournament(tournamentId, horseId, raceId) {
  const { data } = await apiClient.post("/registrations", { tournamentId, horseId, raceId });
  return data.data.registrationId;
}
async function uploadRegistrationAttachment(registrationId, file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerEntityType", "TOURNAMENT_REGISTRATION");
  form.append("ownerEntityId", registrationId);
  await apiClient.post("/attachments", form, { headers: { "Content-Type": "multipart/form-data" } });
}
async function fetchRegistrationAttachments(registrationId) {
  const { data } = await apiClient.get("/attachments", {
    params: { ownerEntityType: "TOURNAMENT_REGISTRATION", ownerEntityId: registrationId }
  });
  return data.data ?? [];
}
async function withdrawRegistration(id) {
  await apiClient.patch(`/registrations/${id}/withdraw`);
}
const OPEN_TOURNAMENT_STATUSES = ["PUBLISHED", "REGISTRATION_OPEN"];
async function fetchOpenTournaments() {
  const { data } = await apiClient.get("/tournaments", {
    params: { size: 100 }
  });
  return toArray(data.data).filter((t) => OPEN_TOURNAMENT_STATUSES.includes(t.status)).map((t) => ({ value: t.tournamentId, label: t.location ? `${t.name} \u2014 ${t.location}` : t.name }));
}
const OPEN_RACE_STATUSES = ["OPEN"];
async function fetchOpenRaces(tournamentId) {
  const { data } = await apiClient.get("/races", {
    params: { tournamentId, size: 100 }
  });
  return toArray(data.data).filter((r) => OPEN_RACE_STATUSES.includes(r.status)).map((r) => ({ value: r.raceId, label: r.name ?? r.raceCode }));
}
async function fetchOwnerHorseOptions() {
  const { data } = await apiClient.get("/owner/horses");
  return toArray(data.data).map((h) => ({ value: h.horseId, label: h.name }));
}
export {
  canWithdraw,
  fetchMyRegistrations,
  fetchOpenRaces,
  fetchOpenTournaments,
  fetchOwnerHorseOptions,
  fetchRegistrationAttachments,
  mapRegistration,
  registerForTournament,
  uploadRegistrationAttachment,
  withdrawRegistration
};
