import { apiClient } from "@/common/lib/apiClient";

// --- local list unwrappers (per-module convention; not shared) ----------------
/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
/** Unwrap a paginated payload into a consistent shape. */
function toPage(d) {
  if (Array.isArray(d))
    return { rows: d, totalPages: 1, page: 0, total: d.length };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
    total: d?.totalElements ?? d?.content?.length ?? 0,
  };
}

// ---------- Predictions ----------
export async function submitPrediction(body) {
  const { data } = await apiClient.post("/predictions", body);
  return data.data;
}
/** GET /predictions/me → bare List<PredictionResponse>. */
export async function fetchMyPredictions() {
  const { data } = await apiClient.get("/predictions/me");
  return toArray(data.data);
}
export async function cancelPrediction(predictionId) {
  await apiClient.post(`/predictions/me/${predictionId}/cancel`);
}

// ---------- Rewards ----------

/** GET /rewards/history → Page (CLAIMED/EXPIRED). */
export async function fetchRewardHistory(query = {}) {
  const { data } = await apiClient.get("/rewards/history", {
    params: { size: 20, ...query },
  });
  return toPage(data.data);
}
/** GET /rewards/notifications → Page (PENDING / claimable). */
export async function fetchPendingRewards(query = {}) {
  const { data } = await apiClient.get("/rewards/notifications", {
    params: { size: 20, ...query },
  });
  return toPage(data.data);
}
export async function claimReward(rewardId) {
  await apiClient.post(`/rewards/${rewardId}/claim`);
}

// ---------- Races (Hub + Predictions pickers) ----------
export async function fetchSpectatorRaces(query = {}) {
  const { data } = await apiClient.get("/races", {
    params: { size: 50, ...query },
  });
  return toPage(data.data);
}

/** One participant (race entry) — mirrors admin's fetchRaceEntries mapping. */
export async function fetchRaceEntries(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  const list = toArray(data.data);
  return list.map((e) => ({
    entryId: e.entryId,
    entryNo: e.entryNo ?? null,
    entryCode: e.entryCode ?? null,
    laneNo: e.laneNo ?? null,
    status: e.status ?? null,
    horseId: e.horseId ?? null,
    horseName: e.horseName ?? null,
    jockeyUserId: e.jockeyUserId ?? null,
    jockeyName: e.jockeyName ?? null,
    weightCarriedLbs: e.weightCarriedLbs ?? null,
    recentForm: e.recentForm ?? null,
    odds: e.odds ?? null,
  }));
}

// ---------- Live monitor ----------
// fetchLiveRace / fetchLiveLeaderboard moved to @/common/live/api; re-exported for existing importers.
export { fetchLiveRace, fetchLiveLeaderboard } from "@/common/live/api";

export async function fetchRaceResults(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data.data;
}

// ---------- Live pool odds (pari-mutuel) ----------
/**
 * GET /races/{raceId}/pools → live ESTIMATED pari-mutuel odds per (predictionType) pool.
 * Odds are summed from live stakes and move as more money enters, so they are only an estimate
 * until the pool closes — there is no fixed odds preview.
 */
export async function fetchLivePoolOdds(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/pools`);
  return toArray(data.data);
}
