import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
async function fetchLiveRace(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/live`);
  return data.data;
}
async function fetchLiveLeaderboard(raceId) {
  const { data } = await apiClient.get(
    `/races/${raceId}/live/leaderboard`
  );
  return toArray(data.data);
}
export {
  fetchLiveLeaderboard,
  fetchLiveRace
};
