import { apiClient } from "@/common/lib/apiClient";

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "STALKER" -> "Stalker", "FRONT_RUNNER" -> "Front Runner". */
export function humanize(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mapProfile(j) {
  return {
    id: j.userId,
    name: j.fullName,
    avatarUrl: j.avatarUrl,
    winRate: j.winRate ?? 0,
    careerWins: j.winCount ?? 0,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : "—",
  };
}

/** Map a BE invitation to the card/modal VM — all fields REAL. */
function mapInvitation(r) {
  return {
    id: r.assignmentId,
    status: r.status,
    horse: r.horseName,
    horseCode: r.horseCode,
    owner: r.ownerName ?? "—",
    race: r.raceName,
    raceCode: r.raceCode ?? "—",
    tournament: r.tournamentName ?? "—",
    tournamentLocation: r.tournamentLocation ?? "—",
    date: r.scheduledStartAt ?? r.invitedAt,
    distanceMeter: r.distanceMeter ?? 0,
    trackCondition: r.trackCondition ?? "—",
    entryNo: r.entryNo,
    entryCode: r.entryCode ?? "—",
    // ----- prize (REAL) -----
    prizePool: r.racePurse ?? 0,
    sharePct: Number(r.jockeySharePercent ?? 0),
    estShare: r.estimatedShare ?? 0,
  };
}

/** GET /jockeys/{id} → jockey profile header VM (real fields only). */
export async function fetchJockeyProfile(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return mapProfile(data.data);
}

/** GET /assignments/invitations?jockeyUserId=&status= → invitation VMs. */
export async function fetchJockeyInvitations(jockeyUserId, status) {
  const { data } = await apiClient.get("/assignments/invitations", {
    params: { jockeyUserId, status },
  });
  return toArray(data.data).map(mapInvitation);
}

/** PATCH /assignments/invitations/{id}/accept → updated invitation. */
export async function acceptInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/accept`,
  );
  return mapInvitation(data.data);
}

/** PATCH /assignments/invitations/{id}/reject → updated invitation. */
export async function rejectInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/reject`,
  );
  return mapInvitation(data.data);
}

/** PATCH /assignments/invitations/{id}/withdraw → ACCEPTED ride → CANCELLED (BE contract #9). */
export async function withdrawInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/withdraw`,
  );
  return mapInvitation(data.data);
}

/** GET /jockeys/me/stats → aggregated performance + earnings (REAL, contract #1). */
export async function fetchJockeyStats() {
  const { data } = await apiClient.get("/jockeys/me/stats");
  return data.data;
}

/** GET /jockeys/me/invitation-insights → REAL (contract #11). */
export async function fetchInvitationInsights() {
  const { data } = await apiClient.get("/jockeys/me/invitation-insights");
  return data.data;
}

/** GET /assignments/me/rides?when=PAST|UPCOMING → the caller's ACCEPTED rides (REAL, #6). */
export async function fetchMyRides(when) {
  const { data } = await apiClient.get("/assignments/me/rides", {
    params: { when },
  });
  return toArray(data.data).map((r, i) => ({
    id: `${r.raceId}-${r.horseName}-${i}`,
    raceId: r.raceId,
    raceName: r.raceName,
    venue: r.venue,
    date: r.date,
    horse: r.horseName,
    finishPosition: r.finishPosition,
    earnings: r.earnings,
  }));
}

/**
 * Leaderboard, ranked by the backend from OFFICIAL race results.
 *
 * This used to fetch the whole jockey roster and sort it client-side by `winCount` — but no
 * backend code ever writes that column, so the table was ordered by stale seed values and could
 * put a rider with zero actual wins on top. It also over-fetched every jockey on each load.
 */
export async function fetchLeaderboard(limit = 5) {
  const { data } = await apiClient.get("/standings/jockeys", { params: { limit } });
  return toArray(data.data);
}

// ----- Derivations from real ride history (no BE win-trend / trophy endpoint) -----

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Wins-per-month for the trailing 12 calendar months, derived from PAST rides
 * (a "win" = finishPosition === 1). Buckets with no wins render as zero so the
 * chart always shows a full 12-month axis.
 */
export function buildWinTrend(rides, now = new Date()) {
  const buckets = [];
  const index = new Map();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    index.set(key, buckets.length);
    buckets.push({ key, month: MONTH_ABBR[d.getUTCMonth()], wins: 0 });
  }
  for (const ride of rides) {
    if (ride.finishPosition !== 1 || !ride.date) continue;
    const d = new Date(ride.date);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const at = index.get(key);
    if (at != null) buckets[at].wins += 1;
  }
  return buckets.map(({ month, wins }) => ({ month, wins }));
}

/** Trophies = races won (finishPosition === 1), newest first, deduped by name+year. */
export function buildTrophies(rides) {
  const seen = new Set();
  const out = [];
  const won = rides
    .filter((r) => r.finishPosition === 1 && r.date != null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  for (const ride of won) {
    const year = new Date(ride.date).getUTCFullYear();
    const key = `${ride.raceName}-${year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: ride.raceName, year });
  }
  return out;
}

// ----- Ride intelligence (REAL, BE contract #7) -----

/** GET /races/{raceId}/entries → minimal {horseId, horseName} list (to resolve horseId by name). */
export async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({
    horseId: e.horseId,
    horseName: e.horseName,
  }));
}

/** GET /horses/{id}/ride-intelligence → form profile for one horse. */
export async function fetchRideIntelligence(horseId) {
  const { data } = await apiClient.get(`/horses/${horseId}/ride-intelligence`);
  return data.data;
}

// ----- Self-edit jockey profile (REAL, BE contract #8) -----

function mapProfileDetail(j) {
  return {
    id: j.userId,
    bodyWeight: j.bodyWeight,
    heightCm: j.heightCm,
    ridingStyle: j.ridingStyle,
    bio: j.bio,
    licenseNo: j.licenseNo,
    baseFee: j.baseFee,
    prizePercent: j.prizePercent,
    fullName: j.fullName,
    email: j.email ?? "—",
    phone: j.phone ?? "—",
    status: j.status ?? "—",
    avatarUrl: j.avatarUrl,
    winCount: j.winCount,
    experienceYrs: j.experienceYrs,
    rating: j.rating,
    winRate: j.winRate,
    recentForm: j.recentForm ?? [],
    lastTrophy: j.lastTrophy,
  };
}

/** GET /jockeys/{id} → full editable profile (seeds the self-edit form). */
export async function fetchJockeyDetail(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return mapProfileDetail(data.data);
}

/**
 * Build a PUT /jockeys/me body, dropping empty/undefined so the update stays
 * PARTIAL (the endpoint cannot null-out a value, so we only send filled fields).
 */
export function toUpdateJockeyProfileRequest(v) {
  const body = {};
  if (v.bodyWeight != null) body.bodyWeight = v.bodyWeight;
  if (v.heightCm != null) body.heightCm = v.heightCm;
  if (v.baseFee != null) body.baseFee = v.baseFee;
  if (v.prizePercent != null) body.prizePercent = v.prizePercent;
  const ridingStyle = v.ridingStyle?.trim();
  if (ridingStyle) body.ridingStyle = ridingStyle;
  const bio = v.bio?.trim();
  if (bio) body.bio = bio;
  const licenseNo = v.licenseNo?.trim();
  if (licenseNo) body.licenseNo = licenseNo;
  return body;
}

/** PUT /jockeys/me → updated full profile. */
export async function updateMyJockeyProfile(body) {
  const { data } = await apiClient.put("/jockeys/me", body);
  return mapProfileDetail(data.data);
}
