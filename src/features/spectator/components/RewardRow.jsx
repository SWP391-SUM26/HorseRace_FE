import { Gift } from "lucide-react";
import { Badge } from "@/common/ui";
import { REWARD_STATUS_META, REWARD_TYPE_LABEL } from "../constants";

/** A single Trophy-Room / shop reward card with a Redeem action. */
export function RewardRow({ reward, onClaim, claiming }) {
  const meta = REWARD_STATUS_META[reward.status];
  // A PENDING reward is claimable — the BE claim endpoint has no balance gate.
  const claimable = reward.status === "PENDING";
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {reward.title ?? REWARD_TYPE_LABEL[reward.rewardType]}
            </p>
            <p className="text-xs text-muted">
              {REWARD_TYPE_LABEL[reward.rewardType]}
            </p>
          </div>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">
        {reward.description ?? "Reward available for redemption."}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-ink">
          {reward.amount.toLocaleString("vi-VN")} pts
        </span>
        {claimable && (
          <button
            type="button"
            onClick={() => onClaim?.(reward.rewardId)}
            disabled={claiming}
            className="h-9 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {claiming ? "Redeeming…" : "Redeem Reward"}
          </button>
        )}
      </div>
    </div>
  );
}
