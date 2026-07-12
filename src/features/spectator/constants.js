import { isAxiosError } from "axios";
function canPredict(status) {
  return status === "SCHEDULED" || status === "OPEN";
}
function parseOdds(odds) {
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
function estimatedReturn(stake, oddsMultiplier) {
  if (!(stake > 0) || !(oddsMultiplier > 0)) return 0;
  return stake * oddsMultiplier;
}
const PREDICTION_TYPE_OPTIONS = [
  { value: "WIN", label: "Win" },
  { value: "PLACE", label: "Place" },
  { value: "SHOW", label: "Show" }
];
const PREDICTION_STATUS_META = {
  PENDING: { label: "Pending", tone: "warning" },
  CONFIRMED: { label: "Confirmed", tone: "info" },
  WON: { label: "Won", tone: "success" },
  LOST: { label: "Lost", tone: "danger" },
  VOID: { label: "Void", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "neutral" }
};
const REWARD_STATUS_META = {
  PENDING: { label: "Available", tone: "info" },
  CLAIMED: { label: "Claimed", tone: "success" },
  EXPIRED: { label: "Expired", tone: "danger" }
};
const REWARD_TYPE_LABEL = {
  DAILY_LOGIN: "Daily Login",
  MILESTONE: "Milestone",
  PROMOTION: "Promotion",
  REFERRAL: "Referral",
  COMPENSATION: "Compensation"
};
function errorMessage(err) {
  if (isAxiosError(err)) {
    const body = err.response?.data;
    if (body?.message) return body.message;
    if (body?.code) return body.code.replace(/_/g, " ");
    if (err.response?.status === 409) return "This item was already actioned or conflicts with an existing one.";
  }
  return "Something went wrong. Please try again.";
}
export {
  PREDICTION_STATUS_META,
  PREDICTION_TYPE_OPTIONS,
  REWARD_STATUS_META,
  REWARD_TYPE_LABEL,
  canPredict,
  errorMessage,
  estimatedReturn,
  parseOdds
};
