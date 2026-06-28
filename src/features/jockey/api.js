import { apiClient } from "@/common/lib/apiClient";
import { initials } from "@/common/lib/format";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function humanize(value) {
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function mapProfile(j) {
  return {
    id: j.userId,
    name: j.fullName,
    avatarUrl: j.avatarUrl,
    winRate: j.winRate ?? 0,
    careerWins: j.winCount ?? 0,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : "\u2014"
  };
}
function mapInvitation(r) {
  return {
    id: r.assignmentId,
    status: r.status,
    horse: r.horseName,
    horseCode: r.horseCode,
    owner: r.ownerName ?? "\u2014",
    race: r.raceName,
    raceCode: r.raceCode ?? "\u2014",
    tournament: r.tournamentName ?? "\u2014",
    tournamentLocation: r.tournamentLocation ?? "\u2014",
    date: r.scheduledStartAt ?? r.invitedAt,
    distanceMeter: r.distanceMeter ?? 0,
    trackCondition: r.trackCondition ?? "\u2014",
    entryNo: r.entryNo,
    entryCode: r.entryCode ?? "\u2014",
    // ----- prize (REAL) -----
    prizePool: r.racePurse ?? 0,
    sharePct: Number(r.jockeySharePercent ?? 0),
    estShare: r.estimatedShare ?? 0
  };
}
async function fetchJockeyProfile(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return mapProfile(data.data);
}
async function fetchJockeyInvitations(jockeyUserId, status) {
  const { data } = await apiClient.get("/assignments/invitations", { params: { jockeyUserId, status } });
  return toArray(data.data).map(mapInvitation);
}
async function acceptInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/accept`
  );
  return mapInvitation(data.data);
}
async function rejectInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/reject`
  );
  return mapInvitation(data.data);
}
async function withdrawInvitation(id) {
  const { data } = await apiClient.patch(
    `/assignments/invitations/${id}/withdraw`
  );
  return mapInvitation(data.data);
}
async function fetchJockeyStats() {
  const { data } = await apiClient.get("/jockeys/me/stats");
  return data.data;
}
async function fetchInvitationInsights() {
  const { data } = await apiClient.get(
    "/jockeys/me/invitation-insights"
  );
  return data.data;
}
async function fetchMyRides(when) {
  const { data } = await apiClient.get("/assignments/me/rides", { params: { when } });
  return toArray(data.data).map((r, i) => ({
    id: `${r.raceId}-${r.horseName}-${i}`,
    raceId: r.raceId,
    raceName: r.raceName,
    venue: r.venue,
    date: r.date,
    horse: r.horseName,
    finishPosition: r.finishPosition,
    earnings: r.earnings
  }));
}
async function fetchLeaderboard(limit = 5) {
  const { data } = await apiClient.get("/jockeys");
  return toArray(data.data).slice().sort((a, b) => (b.winCount ?? 0) - (a.winCount ?? 0)).slice(0, limit).map((j, i) => ({
    rank: i + 1,
    jockeyUserId: j.userId,
    name: j.fullName,
    code: initials(j.fullName) || "\u2014",
    wins: j.winCount ?? 0
  }));
}
const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function buildWinTrend(rides, now = /* @__PURE__ */ new Date()) {
  const buckets = [];
  const index = /* @__PURE__ */ new Map();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
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
function buildTrophies(rides) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const won = rides.filter((r) => r.finishPosition === 1 && r.date != null).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  for (const ride of won) {
    const year = new Date(ride.date).getUTCFullYear();
    const key = `${ride.raceName}-${year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: ride.raceName, year });
  }
  return out;
}
async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({ horseId: e.horseId, horseName: e.horseName }));
}
async function fetchRideIntelligence(horseId) {
  const { data } = await apiClient.get(
    `/horses/${horseId}/ride-intelligence`
  );
  return data.data;
}
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
    email: j.email ?? "\u2014",
    phone: j.phone ?? "\u2014",
    status: j.status ?? "\u2014",
    avatarUrl: j.avatarUrl,
    winCount: j.winCount,
    experienceYrs: j.experienceYrs,
    rating: j.rating,
    winRate: j.winRate,
    recentForm: j.recentForm ?? [],
    lastTrophy: j.lastTrophy
  };
}
async function fetchJockeyDetail(id) {
  const { data } = await apiClient.get(`/jockeys/${id}`);
  return mapProfileDetail(data.data);
}
function toUpdateJockeyProfileRequest(v) {
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
async function updateMyJockeyProfile(body) {
  const { data } = await apiClient.put("/jockeys/me", body);
  return mapProfileDetail(data.data);
}
async function fetchJockeySuggestions(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/jockey-suggestions`);
  const d = data.data;
  return Array.isArray(d) ? d : d?.content ?? [];
}
async function searchJockeys(query) {
  const { data } = await apiClient.get("/jockeys/search", { params: { q: query } });
  const d = Array.isArray(data.data) ? data.data : data.data?.content ?? [];
  return d.map((j) => ({
    id: j.userId,
    name: j.fullName,
    avatarUrl: j.avatarUrl,
    winRate: j.winRate ?? 0,
    careerWins: j.winCount ?? 0,
    ridingStyle: j.ridingStyle ?? "\u2014"
  }));
}
async function fetchJockeysPage(params) {
  const { data } = await apiClient.get("/jockeys/page", { params });
  const d = data.data;
  const rows = Array.isArray(d) ? d : d?.content ?? [];
  return {
    rows: rows.map((j) => ({
      id: j.userId,
      name: j.fullName,
      avatarUrl: j.avatarUrl,
      winRate: j.winRate ?? 0,
      careerWins: j.winCount ?? 0,
      ridingStyle: j.ridingStyle ?? "\u2014"
    })),
    totalPages: Array.isArray(d) ? 1 : d?.totalPages ?? 1,
    page: Array.isArray(d) ? 0 : d?.number ?? 0
  };
}
async function filterJockeys(filter) {
  const { data } = await apiClient.get("/jockeys/filter", { params: filter });
  const d = data.data;
  const rows = Array.isArray(d) ? d : d?.content ?? [];
  return {
    rows: rows.map((j) => ({
      id: j.userId,
      name: j.fullName,
      avatarUrl: j.avatarUrl,
      winRate: j.winRate ?? 0,
      careerWins: j.winCount ?? 0,
      ridingStyle: j.ridingStyle ?? "\u2014"
    })),
    totalPages: Array.isArray(d) ? 1 : d?.totalPages ?? 1,
    page: Array.isArray(d) ? 0 : d?.number ?? 0
  };
}
export {
  acceptInvitation,
  buildTrophies,
  buildWinTrend,
  fetchInvitationInsights,
  fetchJockeyDetail,
  fetchJockeyInvitations,
  fetchJockeyProfile,
  fetchJockeyStats,
  fetchJockeySuggestions,
  fetchJockeysPage,
  fetchLeaderboard,
  fetchMyRides,
  fetchRaceEntries,
  fetchRideIntelligence,
  filterJockeys,
  humanize,
  rejectInvitation,
  searchJockeys,
  toUpdateJockeyProfileRequest,
  updateMyJockeyProfile,
  withdrawInvitation
};
