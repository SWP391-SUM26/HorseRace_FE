import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function humanize(value) {
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function mapJockey(j) {
  return {
    userId: j.userId,
    id: j.userCode || j.userId,
    fullName: j.fullName,
    avatarUrl: j.avatarUrl,
    status: j.status ?? "PRO",
    winCount: j.winCount ?? 0,
    bodyWeight: j.bodyWeight ?? 0,
    rating: j.rating ?? 0,
    compatibility: null,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : "\u2014",
    winRate2km: j.winRate ?? 0,
    last5: (j.recentForm ?? []).map((f) => f === "W"),
    baseFee: j.baseFee != null ? `$${j.baseFee.toLocaleString("en-US")}` : "\u2014",
    prizePct: j.prizePercent != null ? `${j.prizePercent}% of Purse` : "\u2014",
    trophyCabinet: j.lastTrophy ?? "\u2014"
  };
}
async function fetchJockeys() {
  const { data } = await apiClient.get(
    "/jockeys"
  );
  return toArray(data.data).map(mapJockey);
}
async function fetchUnassignedEntries() {
  const { data } = await apiClient.get("/owner/unassigned-entries");
  return toArray(data.data).map((e) => ({
    // A horse (registrationId) can be entered in multiple races, so the row id
    // must combine registration + race to stay unique.
    id: `${e.registrationId}-${e.raceId}`,
    name: e.horseName,
    race: e.raceName,
    date: e.raceDate,
    raceId: e.raceId,
    horseId: e.horseId
  }));
}
async function fetchJockeySuggestions(raceId, horseId) {
  const { data } = await apiClient.get(`/races/${raceId}/jockey-suggestions`, { params: { horseId } });
  return toArray(data.data);
}
async function fetchRaceDetail(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}`);
  const r = data.data;
  return {
    course: r.tournamentName ?? "\u2014",
    distance: r.distanceMeter != null ? `${r.distanceMeter}m` : "\u2014",
    grade: r.raceType ?? "\u2014",
    purse: "\u2014"
  };
}
function findEntryId(entries, horseId) {
  return entries.find((e) => e.horseId === horseId)?.entryId ?? null;
}
function mapInvitation(r) {
  return {
    id: r.assignmentId,
    status: r.status,
    invitedAt: r.invitedAt,
    horse: r.horseName,
    race: r.raceName,
    tournament: r.tournamentName ?? "\u2014",
    jockey: r.jockeyName,
    jockeyAvatarUrl: r.jockeyAvatarUrl
  };
}
async function resolveEntryId(raceId, horseId) {
  const { data } = await apiClient.get(
    `/races/${raceId}/entries`
  );
  const entries = Array.isArray(data.data) ? data.data : data.data.content ?? [];
  return findEntryId(entries, horseId);
}
async function sendInvitation(entryId, jockeyUserId) {
  await apiClient.post("/assignments/invitations", { entryId, jockeyUserId });
}
async function fetchMyInvitations() {
  const { data } = await apiClient.get("/assignments/invitations");
  const list = Array.isArray(data.data) ? data.data : data.data.content ?? [];
  return list.map(mapInvitation);
}
async function cancelInvitation(assignmentId) {
  await apiClient.delete(`/assignments/invitations/${assignmentId}`);
}
export {
  cancelInvitation,
  fetchJockeySuggestions,
  fetchJockeys,
  fetchMyInvitations,
  fetchRaceDetail,
  fetchUnassignedEntries,
  findEntryId,
  mapInvitation,
  resolveEntryId,
  sendInvitation
};
