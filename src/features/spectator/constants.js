/** Betting-window gating: a prediction is accepted only for a CLOSED, locked, pre-cutoff race. */
export function canPredict(status) {
  return status === "CLOSED";
}

/**
 * Parse a BE odds string into a decimal multiplier.
 * Accepts decimal ("3.5") or fractional ("5/1" → 6). Returns null when unparseable.
 */
export function parseOdds(odds) {
  if (!odds) return null;
  const raw = odds.trim();
  if (!raw) return null;
  if (raw.includes("/")) {
    const [a, b] = raw.split("/").map((p) => Number(p.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return a / b + 1;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Client-side preview of the potential return. Never negative. */
export function estimatedReturn(stake, oddsMultiplier) {
  if (!(stake > 0) || !(oddsMultiplier > 0)) return 0;
  return stake * oddsMultiplier;
}

/**
 * Bet-type options for the single-runner predictions UI.
 * Restricted to WIN|PLACE|SHOW — EXACTA/QUINELLA need multiple runners this UI can't express.
 */
export const PREDICTION_TYPE_OPTIONS = [
  { value: "WIN", label: "Win" },
  { value: "PLACE", label: "Place" },
  { value: "SHOW", label: "Show" },
];

export const PREDICTION_STATUS_META = {
  PENDING: { label: "Pending", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "info" },
  WON: { label: "Won", tone: "success" },
  LOST: { label: "Lost", tone: "danger" },
  VOID: { label: "Void", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export const REWARD_STATUS_META = {
  PENDING: { label: "Available", tone: "info" },
  CLAIMED: { label: "Claimed", tone: "success" },
  EXPIRED: { label: "Expired", tone: "danger" },
};

export const REWARD_TYPE_LABEL = {
  DAILY_LOGIN: "Daily Login",
  MILESTONE: "Milestone",
  PROMOTION: "Promotion",
  REFERRAL: "Referral",
  COMPENSATION: "Compensation",
};
