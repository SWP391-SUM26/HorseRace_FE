import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPrediction,
  claimReward,
  fetchMyPredictions,
  fetchPendingRewards,
  fetchRaceEntries,
  fetchRaceResults,
  fetchRewardHistory,
  fetchSpectatorRaces,
  submitPrediction
} from "./api";
function useSpectatorRaces(query = {}, options = {}) {
  return useQuery({
    queryKey: ["spectator", "races", query],
    queryFn: () => fetchSpectatorRaces(query),
    refetchInterval: options.refetchInterval ?? false
  });
}
function useRaceEntries(raceId) {
  return useQuery({
    queryKey: ["spectator", "race-entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId
  });
}
function useEntryNames(raceIds) {
  const uniqueIds = useMemo(() => [...new Set(raceIds.filter(Boolean))], [raceIds]);
  return useQueries({
    queries: uniqueIds.map((raceId) => ({
      queryKey: ["spectator", "race-entries", raceId],
      queryFn: () => fetchRaceEntries(raceId)
    })),
    combine: (results) => {
      const map = /* @__PURE__ */ new Map();
      for (const r of results) {
        for (const e of r.data ?? []) {
          if (e.horseName) map.set(e.entryId, e.horseName);
        }
      }
      return map;
    }
  });
}
function useRaceResults(raceId) {
  return useQuery({
    queryKey: ["spectator", "race-results", raceId],
    queryFn: () => fetchRaceResults(raceId),
    enabled: !!raceId
  });
}
function useMyPredictions() {
  return useQuery({ queryKey: ["spectator", "predictions"], queryFn: fetchMyPredictions });
}
function useSubmitPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => submitPrediction(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spectator", "predictions"] })
  });
}
function useCancelPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (predictionId) => cancelPrediction(predictionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spectator", "predictions"] })
  });
}
function useRewardHistory(query = {}) {
  return useQuery({ queryKey: ["spectator", "rewards", "history", query], queryFn: () => fetchRewardHistory(query) });
}
function usePendingRewards(query = {}) {
  return useQuery({ queryKey: ["spectator", "rewards", "pending", query], queryFn: () => fetchPendingRewards(query) });
}
function useClaimReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId) => claimReward(rewardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["spectator", "rewards"] })
  });
}
import { useLiveRace, useLiveLeaderboard } from "@/common/live/useLiveRace";
export {
  useCancelPrediction,
  useClaimReward,
  useEntryNames,
  useLiveLeaderboard,
  useLiveRace,
  useMyPredictions,
  usePendingRewards,
  useRaceEntries,
  useRaceResults,
  useRewardHistory,
  useSpectatorRaces,
  useSubmitPrediction
};
