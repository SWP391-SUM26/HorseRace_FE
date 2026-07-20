import { Badge } from "@/common/ui";
import { formatMoney } from "@/common/lib/format";
import { canPredict, estimatedReturn } from "../constants";
import { PREDICTION_TYPE_OPTIONS } from "../constants";

/** Pari-mutuel floor: the smallest accepted stake, in VND. */
export const MIN_STAKE = 10_000;

/** The dark-green "Potential Rewards" panel with the CONFIRM CTA (or a closed block when the pool is shut). */
export function BettingPanel({
  raceStatus,
  selectionLabel,
  stake,
  onStakeChange,
  predictionType = "WIN",
  onTypeChange,
  onConfirm,
  submitting,
  estimatedPayoutPerUnit = null,
  poolTotalStake = null,
  oddsLoading = false,
}) {
  const open = canPredict(raceStatus);
  const belowMin = !(stake >= MIN_STAKE);
  const hasLiveOdds =
    estimatedPayoutPerUnit != null && estimatedPayoutPerUnit > 0;
  const estReturn = hasLiveOdds
    ? estimatedReturn(stake, estimatedPayoutPerUnit)
    : 0;

  return (
    <div className="rounded-2xl bg-brand-900 p-5 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-50/80">
        Potential Rewards
      </p>

      <div className="mt-4 rounded-xl bg-white/10 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">
          Current Selection
        </p>
        <p className="mt-1 text-lg font-semibold">
          {selectionLabel ?? "No runner selected"}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-brand-50/80">
            Live odds:{" "}
            {oddsLoading
              ? "…"
              : hasLiveOdds
                ? `${estimatedPayoutPerUnit.toFixed(2)}×`
                : "—"}
          </p>
          <Badge tone="info">Estimated</Badge>
        </div>
        {poolTotalStake != null && poolTotalStake > 0 && (
          <p className="mt-1 text-xs text-white/50">
            Pool: {formatMoney(poolTotalStake)}
          </p>
        )}
      </div>

      {!open ? (
        <div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-4 text-center">
          <Badge tone="danger">Betting closed</Badge>
          <p className="mt-2 text-sm text-white/80">
            Predictions open only once the field is locked (race CLOSED, before
            cutoff).
          </p>
        </div>
      ) : (
        <>
          {onTypeChange && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-white/60">
                Bet Type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PREDICTION_TYPE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => onTypeChange(o.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      predictionType === o.value
                        ? "bg-white text-brand-900"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label
              htmlFor="stake"
              className="mb-1.5 block text-xs uppercase tracking-wide text-white/60"
            >
              Stake (VND)
            </label>
            <input
              id="stake"
              type="number"
              min={MIN_STAKE}
              step={10_000}
              value={stake || ""}
              onChange={(e) => onStakeChange(Number(e.target.value))}
              className="h-11 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter stake in VND"
            />

            {belowMin && (
              <p className="mt-1.5 text-xs font-medium text-amber-200">
                Minimum stake is {formatMoney(MIN_STAKE)}.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-4">
            <span className="flex items-center gap-1.5 text-sm text-white/70">
              Estimated Return
              <Badge tone="info">Estimated</Badge>
            </span>
            <span className="text-xl font-bold tabular-nums">
              {hasLiveOdds ? formatMoney(estReturn) : "—"}
            </span>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !selectionLabel || belowMin}
            className="mt-4 h-12 w-full rounded-xl bg-white text-sm font-bold text-brand-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "CONFIRM PREDICTION"}
          </button>
        </>
      )}
    </div>
  );
}
