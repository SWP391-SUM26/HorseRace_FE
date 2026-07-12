// ---------- Enums (mirror BE) ----------
export type PredictionType = 'WIN' | 'PLACE' | 'SHOW' | 'EXACTA' | 'QUINELLA';
export type PredictionStatus = 'PENDING' | 'CONFIRMED' | 'WON' | 'LOST' | 'VOID' | 'REFUNDED';
export type RewardStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED';
export type RewardType = 'DAILY_LOGIN' | 'MILESTONE' | 'PROMOTION' | 'REFERRAL' | 'COMPENSATION';
/** Race lifecycle (same values as admin RaceStatus). */
export type RaceStatus =
  | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'RUNNING' | 'FINISHED' | 'OFFICIAL' | 'CANCELLED';

// ---------- Predictions ----------
/** POST /predictions request body. */
export interface PredictionRequest {
  raceId: string;
  predictedEntryId?: string;
  predictionType: PredictionType;
  stakeAmount: number;
  idempotencyKey?: string;
}
/** PredictionResponse (BE). */
export interface PredictionResponse {
  predictionId: string;
  raceId: string;
  raceCode: string | null;
  raceName: string | null;
  spectatorUserId?: string | null;
  predictedEntryId: string | null;
  predictionType: PredictionType;
  lockedOdds: string | null;
  stakeAmount: number;
  potentialPayout: number | null;
  status: PredictionStatus;
  submittedAt: string | null;
  settledAt: string | null;
  createdAt?: string | null;
}

// ---------- Rewards ----------
/** RewardResponse (BE). */
export interface RewardResponse {
  rewardId: string;
  rewardType: RewardType;
  amount: number;
  title: string | null;
  description: string | null;
  status: RewardStatus;
  expiresAt: string | null;
  claimedAt: string | null;
  createdAt: string | null;
}

// ---------- Live race ----------
// Moved to the shared @/common/live module (referee now consumes these cross-feature).
// Re-exported here so existing spectator imports keep working.
export type { RunnerRow, LiveRaceResponse } from '@/common/live/types';

// ---------- Race list (Hub / Predictions pickers) ----------
/** A race row from GET /races (subset used by the spectator module). */
export interface SpectatorRace {
  raceId: string;
  raceCode: string | null;
  name: string | null;
  raceType: string | null;
  distanceMeter: number | null;
  venue: string | null;
  venueName?: string | null;
  scheduledStartAt: string | null;
  status: RaceStatus;
  tournamentId: string | null;
  tournamentName: string | null;
  totalPurse?: number | null;
  trackCondition?: string | null;
}

// ---------- Official results ----------
export interface RaceResultRow {
  resultId: string;
  finishPosition: number | null;
  entryNo: number | null;
  horseName: string;
  jockeyName: string | null;
  finishTimeMs: number | null;
  lengthsBehind: number | null;
  odds: string | null;
}
export interface RaceResults {
  raceId: string;
  officialityStatus: string;
  winningTimeMs: number | null;
  order: RaceResultRow[];
}
