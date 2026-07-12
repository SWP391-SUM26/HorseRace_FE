import { apiClient } from '@/common/lib/apiClient';
import type { LiveRaceResponse, RunnerRow } from './types';

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

export async function fetchLiveRace(raceId: string): Promise<LiveRaceResponse> {
  const { data } = await apiClient.get<{ data: LiveRaceResponse }>(`/races/${raceId}/live`);
  return data.data;
}
export async function fetchLiveLeaderboard(raceId: string): Promise<RunnerRow[]> {
  const { data } = await apiClient.get<{ data: RunnerRow[] | { content?: RunnerRow[] } }>(
    `/races/${raceId}/live/leaderboard`,
  );
  return toArray(data.data);
}
