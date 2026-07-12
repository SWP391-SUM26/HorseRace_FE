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
async function submitPrediction(body) {
  const { data } = await apiClient.post("/predictions", body);
  return data.data;
}
async function fetchMyPredictions() {
  const { data } = await apiClient.get(
    "/predictions/me"
  );
  return toArray(data.data);
}
async function cancelPrediction(predictionId) {
  await apiClient.post(`/predictions/me/${predictionId}/cancel`);
}
async function fetchRewardHistory(query = {}) {
  const { data } = await apiClient.get("/rewards/history", {
    params: { size: 20, ...query }
  });
  return toPage(data.data);
}
async function fetchPendingRewards(query = {}) {
  const { data } = await apiClient.get("/rewards/notifications", {
    params: { size: 20, ...query }
  });
  return toPage(data.data);
}
async function claimReward(rewardId) {
  await apiClient.post(`/rewards/${rewardId}/claim`);
}
async function fetchSpectatorRaces(query = {}) {
  const { data } = await apiClient.get("/races", {
    params: { size: 50, ...query }
  });
  return toPage(data.data);
}
async function fetchRaceEntries(raceId) {
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
    odds: e.odds ?? null
  }));
}
import { fetchLiveRace, fetchLiveLeaderboard } from "@/common/live/api";
async function fetchRaceResults(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data.data;
}
export {
  cancelPrediction,
  claimReward,
  fetchLiveLeaderboard,
  fetchLiveRace,
  fetchMyPredictions,
  fetchPendingRewards,
  fetchRaceEntries,
  fetchRaceResults,
  fetchRewardHistory,
  fetchSpectatorRaces,
  submitPrediction
};
