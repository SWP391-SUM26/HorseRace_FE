import { useQuery } from '@tanstack/react-query';
import { fetchLiveLeaderboard, fetchLiveRace } from './api';

// ---------- Live monitor (polling) ----------
/** Poll fast (~2.5s) only while the race is RUNNING; never in the background. */
export function useLiveRace(raceId: string | null, running: boolean) {
  return useQuery({
    queryKey: ['spectator', 'live', raceId],
    queryFn: () => fetchLiveRace(raceId!),
    enabled: !!raceId,
    refetchInterval: running ? 2500 : false,
    refetchIntervalInBackground: false,
  });
}
export function useLiveLeaderboard(raceId: string | null, running: boolean) {
  return useQuery({
    queryKey: ['spectator', 'live-leaderboard', raceId],
    queryFn: () => fetchLiveLeaderboard(raceId!),
    enabled: !!raceId,
    refetchInterval: running ? 2500 : false,
    refetchIntervalInBackground: false,
  });
}
