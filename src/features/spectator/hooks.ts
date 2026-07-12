import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelPrediction,
  claimReward,
  fetchMyPredictions,
  fetchPendingRewards,
  fetchRaceEntries,
  fetchRaceResults,
  fetchRewardHistory,
  fetchSpectatorRaces,
  submitPrediction,
  type RewardQuery,
  type SpectatorRaceQuery,
} from './api';
import type { PredictionRequest } from './types';

// ---------- Races ----------
/**
 * Race list. Pass `refetchInterval` to keep race status fresh while mounted (e.g. the live page,
 * so a race flipping out of RUNNING actually stops the fast live poll).
 */
export function useSpectatorRaces(query: SpectatorRaceQuery = {}, options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['spectator', 'races', query],
    queryFn: () => fetchSpectatorRaces(query),
    refetchInterval: options.refetchInterval ?? false,
  });
}
export function useRaceEntries(raceId: string | null) {
  return useQuery({
    queryKey: ['spectator', 'race-entries', raceId],
    queryFn: () => fetchRaceEntries(raceId!),
    enabled: !!raceId,
  });
}
/**
 * Resolve `entryId → horseName` across a set of races. Fires one entries query per
 * unique `raceId` (sharing the `useRaceEntries` cache keys) and folds every race's
 * runners into a single Map for display lookups — e.g. the prediction-history table,
 * which only carries `predictedEntryId`, not the horse name.
 */
export function useEntryNames(raceIds: string[]) {
  const uniqueIds = useMemo(() => [...new Set(raceIds.filter(Boolean))], [raceIds]);
  return useQueries({
    queries: uniqueIds.map((raceId) => ({
      queryKey: ['spectator', 'race-entries', raceId],
      queryFn: () => fetchRaceEntries(raceId),
    })),
    combine: (results) => {
      const map = new Map<string, string>();
      for (const r of results) {
        for (const e of r.data ?? []) {
          if (e.horseName) map.set(e.entryId, e.horseName);
        }
      }
      return map;
    },
  });
}
export function useRaceResults(raceId: string | null) {
  return useQuery({
    queryKey: ['spectator', 'race-results', raceId],
    queryFn: () => fetchRaceResults(raceId!),
    enabled: !!raceId,
  });
}

// ---------- Predictions ----------
export function useMyPredictions() {
  return useQuery({ queryKey: ['spectator', 'predictions'], queryFn: fetchMyPredictions });
}
export function useSubmitPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PredictionRequest) => submitPrediction(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spectator', 'predictions'] }),
  });
}
export function useCancelPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (predictionId: string) => cancelPrediction(predictionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spectator', 'predictions'] }),
  });
}

// ---------- Rewards ----------
export function useRewardHistory(query: RewardQuery = {}) {
  return useQuery({ queryKey: ['spectator', 'rewards', 'history', query], queryFn: () => fetchRewardHistory(query) });
}
export function usePendingRewards(query: RewardQuery = {}) {
  return useQuery({ queryKey: ['spectator', 'rewards', 'pending', query], queryFn: () => fetchPendingRewards(query) });
}
export function useClaimReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) => claimReward(rewardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spectator', 'rewards'] }),
  });
}

// ---------- Live monitor (polling) ----------
// useLiveRace / useLiveLeaderboard moved to @/common/live; re-exported for existing importers.
export { useLiveRace, useLiveLeaderboard } from '@/common/live/useLiveRace';
