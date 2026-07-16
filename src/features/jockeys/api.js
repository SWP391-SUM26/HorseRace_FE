import { apiClient } from "@/common/lib/apiClient";

function toArray(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
}

function humanize(value) {
  if (!value) return "—";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mapJockey(jockey) {
  return {
    userId: jockey.userId,
    id: jockey.userCode || jockey.userId,
    fullName: jockey.fullName,
    avatarUrl: jockey.avatarUrl,
    status: jockey.status ?? "PRO",
    winCount: jockey.winCount ?? 0,
    bodyWeight: jockey.bodyWeight ?? 0,
    rating: jockey.rating ?? 0,
    compatibility: null,
    eligible: true,
    ridingStyle: humanize(jockey.ridingStyle),
    winRate2km: jockey.winRate ?? 0,
    last5: (jockey.recentForm ?? []).map((form) => form === "W"),
    baseFee: jockey.baseFee != null ? `$${jockey.baseFee.toLocaleString("en-US")}` : "—",
    prizePct: jockey.prizePercent != null ? `${jockey.prizePercent}% of Purse` : "—",
    trophyCabinet: jockey.lastTrophy ?? "—"
  };
}

export async function fetchJockeys() {
  const { data } = await apiClient.get("/jockeys");
  return toArray(data.data).map(mapJockey);
}

export async function fetchUnassignedEntries() {
  const { data } = await apiClient.get("/owner/unassigned-entries");
  return toArray(data.data).map((entry) => ({
    id: `${entry.registrationId}-${entry.raceId}`,
    name: entry.horseName,
    race: entry.raceName,
    date: entry.raceDate,
    raceId: entry.raceId,
    horseId: entry.horseId
  }));
}

export async function fetchJockeySuggestions(raceId, horseId) {
  const { data } = await apiClient.get(`/races/${raceId}/jockey-suggestions`, {
    params: { horseId }
  });
  return toArray(data.data);
}

export async function fetchRaceDetail(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}`);
  const race = data.data;
  return {
    course: race?.tournamentName ?? "—",
    distance: race?.distanceMeter != null ? `${race.distanceMeter}m` : "—",
    grade: race?.raceType ?? "—",
    purse: "—"
  };
}

export function findEntryId(entries, horseId) {
  return entries.find((entry) => entry.horseId === horseId)?.entryId ?? null;
}

export function mapInvitation(row) {
  return {
    id: row.assignmentId,
    status: row.status,
    invitedAt: row.invitedAt,
    horseId: row.horseId,
    horse: row.horseName,
    horseCode: row.horseCode,
    raceId: row.raceId,
    race: row.raceName,
    scheduledStartAt: row.scheduledStartAt,
    tournament: row.tournamentName ?? "—",
    jockeyUserId: row.jockeyUserId,
    jockey: row.jockeyName,
    jockeyAvatarUrl: row.jockeyAvatarUrl,
    entryId: row.entryId,
    entryNo: row.entryNo
  };
}

export async function resolveEntryId(raceId, horseId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  return findEntryId(toArray(data.data), horseId);
}

export async function sendInvitation(entryId, jockeyUserId) {
  await apiClient.post("/assignments/invitations", { entryId, jockeyUserId });
}

export async function fetchMyInvitations(ownerUserId) {
  const { data } = await apiClient.get("/assignments/invitations", {
    params: { ownerUserId, size: 100 }
  });
  return toArray(data.data).map(mapInvitation);
}

export async function cancelInvitation(assignmentId) {
  await apiClient.delete(`/assignments/invitations/${assignmentId}`);
}
