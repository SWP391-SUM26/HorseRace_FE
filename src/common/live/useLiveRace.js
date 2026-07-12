import { useQuery } from "@tanstack/react-query";
import { fetchLiveLeaderboard, fetchLiveRace } from "./api";
function useLiveRace(raceId, running) {
  return useQuery({
    queryKey: ["spectator", "live", raceId],
    queryFn: () => fetchLiveRace(raceId),
    enabled: !!raceId,
    refetchInterval: running ? 2500 : false,
    refetchIntervalInBackground: false
  });
}
function useLiveLeaderboard(raceId, running) {
  return useQuery({
    queryKey: ["spectator", "live-leaderboard", raceId],
    queryFn: () => fetchLiveLeaderboard(raceId),
    enabled: !!raceId,
    refetchInterval: running ? 2500 : false,
    refetchIntervalInBackground: false
  });
}
export {
  useLiveLeaderboard,
  useLiveRace
};
