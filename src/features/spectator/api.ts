import { apiClient } from '@/common/lib/apiClient';
import type {
  PredictionRequest,
  PredictionResponse,
  RaceResults,
  RewardResponse,
  SpectatorRace,
} from './types';

// --- local list unwrappers (per-module convention; not shared) ----------------
/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
/** Unwrap a paginated payload into a consistent shape. */
function toPage<T>(
  d: T[] | { content?: T[]; totalPages?: number; number?: number; totalElements?: number } | undefined | null,
): { rows: T[]; totalPages: number; page: number; total: number } {
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0, total: d.length };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
    total: d?.totalElements ?? (d?.content?.length ?? 0),
  };
}

// ---------- Predictions ----------
export async function submitPrediction(body: PredictionRequest): Promise<PredictionResponse> {
  const { data } = await apiClient.post<{ data: PredictionResponse }>('/predictions', body);
  return data.data;
}
/** GET /predictions/me → bare List<PredictionResponse>. */
export async function fetchMyPredictions(): Promise<PredictionResponse[]> {
  const { data } = await apiClient.get<{ data: PredictionResponse[] | { content?: PredictionResponse[] } }>(
    '/predictions/me',
  );
  return toArray(data.data);
}
export async function cancelPrediction(predictionId: string): Promise<void> {
  await apiClient.post(`/predictions/me/${predictionId}/cancel`);
}

// ---------- Rewards ----------
export interface RewardQuery { page?: number; size?: number }
/** A list payload that may be a bare array or a Spring Page object. */
type PageOrArray<T> = T[] | { content?: T[]; totalPages?: number; number?: number; totalElements?: number };

/** GET /rewards/history → Page (CLAIMED/EXPIRED). */
export async function fetchRewardHistory(query: RewardQuery = {}) {
  const { data } = await apiClient.get<{ data: PageOrArray<RewardResponse> }>('/rewards/history', {
    params: { size: 20, ...query },
  });
  return toPage<RewardResponse>(data.data);
}
/** GET /rewards/notifications → Page (PENDING / claimable). */
export async function fetchPendingRewards(query: RewardQuery = {}) {
  const { data } = await apiClient.get<{ data: PageOrArray<RewardResponse> }>('/rewards/notifications', {
    params: { size: 20, ...query },
  });
  return toPage<RewardResponse>(data.data);
}
export async function claimReward(rewardId: string): Promise<void> {
  await apiClient.post(`/rewards/${rewardId}/claim`);
}

// ---------- Races (Hub + Predictions pickers) ----------
export interface SpectatorRaceQuery {
  status?: string;
  tournamentId?: string;
  page?: number;
  size?: number;
}
export async function fetchSpectatorRaces(query: SpectatorRaceQuery = {}) {
  const { data } = await apiClient.get<{ data: PageOrArray<SpectatorRace> }>('/races', {
    params: { size: 50, ...query },
  });
  return toPage<SpectatorRace>(data.data);
}

/** One participant (race entry) — mirrors admin's fetchRaceEntries mapping. */
export interface RaceEntry {
  entryId: string;
  entryNo: number | null;
  entryCode: string | null;
  laneNo: number | null;
  status: string | null;
  horseId: string | null;
  horseName: string | null;
  jockeyUserId: string | null;
  jockeyName: string | null;
  weightCarriedLbs: number | null;
  recentForm: string | null;
  odds: string | null;
}
export async function fetchRaceEntries(raceId: string): Promise<RaceEntry[]> {
  const { data } = await apiClient.get<{ data: RaceEntry[] | { content?: RaceEntry[] } }>(`/races/${raceId}/entries`);
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
export { fetchLiveRace, fetchLiveLeaderboard } from '@/common/live/api';

export async function fetchRaceResults(raceId: string): Promise<RaceResults | null> {
  const { data } = await apiClient.get<{ data: RaceResults | null }>(`/races/${raceId}/results`);
  return data.data;
}
