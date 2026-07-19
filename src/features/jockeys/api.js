import { apiClient } from "@/common/lib/apiClient";

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "FRONT_RUNNER" -> "Front Runner". */
function humanize(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Map a BE jockey to a marketplace card using real fields only. */
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
    eligible: true,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : "—",
    winRate2km: j.winRate ?? 0,
    last5: (j.recentForm ?? []).map((f) => f === "W"),
    baseFee:
      j.baseFee != null
        ? `${Math.round(j.baseFee).toLocaleString("vi-VN")}₫`
        : "—",
    prizePct: j.prizePercent != null ? `${j.prizePercent}% of Purse` : "—",
    trophyCabinet: j.lastTrophy ?? "—",
  };
}

/** GET /jockeys → marketplace cards (real fields, no compatibility yet). */
export async function fetchJockeys() {
  const { data } = await apiClient.get("/jockeys");
  return toArray(data.data).map(mapJockey);
}

/** GET /owner/unassigned-entries → left-rail rows. */
export async function fetchUnassignedEntries() {
  const { data } = await apiClient.get("/owner/unassigned-entries");
  return toArray(data.data).map((e) => ({
    // A horse (registrationId) can be entered in multiple races, so the row id
    // must combine registration + race to stay unique.
    id: `${e.registrationId}-${e.raceId}`,
    name: e.horseName,
    race: e.raceName,
    date: e.raceDate,
    raceId: e.raceId,
    horseId: e.horseId,
  }));
}

/** GET /races/{raceId}/jockey-suggestions?horseId={horseId} → compatibility scores. */
export async function fetchJockeySuggestions(raceId, horseId) {
  const { data } = await apiClient.get(
    `/races/${raceId}/jockey-suggestions`,
    { params: { horseId } },
  );
  return toArray(data.data);
}

/** GET /races/{raceId} → "Selected Race Details" view model. */
export async function fetchRaceDetail(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}`);
  const r = data.data;
  return {
    course: r.tournamentName ?? "—",
    distance: r.distanceMeter != null ? `${r.distanceMeter}m` : "—",
    grade: r.raceType ?? "—",
    purse: "—",
  };
}

export function findEntryId(entries, horseId) {
  return entries.find((e) => e.horseId === horseId)?.entryId ?? null;
}

export function mapInvitation(r) {
  return {
    id: r.assignmentId,
    status: r.status,
    invitedAt: r.invitedAt,
    horseId: r.horseId,
    horse: r.horseName,
    horseCode: r.horseCode,
    raceId: r.raceId,
    race: r.raceName,
    scheduledStartAt: r.scheduledStartAt,
    tournament: r.tournamentName ?? "—",
    jockeyUserId: r.jockeyUserId,
    jockey: r.jockeyName,
    jockeyAvatarUrl: r.jockeyAvatarUrl,
    entryId: r.entryId,
    entryNo: r.entryNo,
  };
}

/** Resolve the owner's entryId for a horse in a race (invite needs entryId, not registrationId). */
export async function resolveEntryId(raceId, horseId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  const entries = Array.isArray(data.data)
    ? data.data
    : (data.data.content ?? []);
  return findEntryId(entries, horseId);
}

export async function sendInvitation(entryId, jockeyUserId) {
  await apiClient.post("/assignments/invitations", { entryId, jockeyUserId });
}

/** The invitations THIS owner has sent (scoped to ownerUserId, not the whole system). */
export async function fetchMyInvitations(ownerUserId) {
  const { data } = await apiClient.get("/assignments/invitations", {
    params: { ownerUserId, size: 100 },
  });
  const list = Array.isArray(data.data)
    ? data.data
    : (data.data.content ?? []);
  return list.map(mapInvitation);
}

export async function cancelInvitation(assignmentId) {
  await apiClient.delete(`/assignments/invitations/${assignmentId}`);
}
