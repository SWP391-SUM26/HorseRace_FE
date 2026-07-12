import { isAxiosError } from 'axios';
import type { PredictionStatus, PredictionType, RaceStatus, RewardStatus, RewardType } from './types';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Betting-pool gating: a prediction is accepted only for a SCHEDULED/OPEN race (pool open). */
export function canPredict(status: RaceStatus | string | null | undefined): boolean {
  return status === 'SCHEDULED' || status === 'OPEN';
}

/**
 * Parse a BE odds string into a decimal multiplier.
 * Accepts decimal ("3.5") or fractional ("5/1" → 6). Returns null when unparseable.
 */
export function parseOdds(odds: string | null | undefined): number | null {
  if (!odds) return null;
  const raw = odds.trim();
  if (!raw) return null;
  if (raw.includes('/')) {
    const [a, b] = raw.split('/').map((p) => Number(p.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b + 1;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Client-side preview of the potential return. Never negative. */
export function estimatedReturn(stake: number, oddsMultiplier: number): number {
  if (!(stake > 0) || !(oddsMultiplier > 0)) return 0;
  return stake * oddsMultiplier;
}

/**
 * Bet-type options for the single-runner predictions UI.
 * Restricted to WIN|PLACE|SHOW — EXACTA/QUINELLA need multiple runners this UI can't express.
 */
export const PREDICTION_TYPE_OPTIONS: { value: PredictionType; label: string }[] = [
  { value: 'WIN', label: 'Win' },
  { value: 'PLACE', label: 'Place' },
  { value: 'SHOW', label: 'Show' },
];

export const PREDICTION_STATUS_META: Record<PredictionStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'info' },
  WON: { label: 'Won', tone: 'success' },
  LOST: { label: 'Lost', tone: 'danger' },
  VOID: { label: 'Void', tone: 'neutral' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

export const REWARD_STATUS_META: Record<RewardStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Available', tone: 'info' },
  CLAIMED: { label: 'Claimed', tone: 'success' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
};

export const REWARD_TYPE_LABEL: Record<RewardType, string> = {
  DAILY_LOGIN: 'Daily Login',
  MILESTONE: 'Milestone',
  PROMOTION: 'Promotion',
  REFERRAL: 'Referral',
  COMPENSATION: 'Compensation',
};

/** Map an axios error to a user-facing message (prefers the BE ApiResponse.message / error code). */
export function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as { message?: string; code?: string } | undefined;
    if (body?.message) return body.message;
    if (body?.code) return body.code.replace(/_/g, ' ');
    if (err.response?.status === 409) return 'This item was already actioned or conflicts with an existing one.';
  }
  return 'Something went wrong. Please try again.';
}
