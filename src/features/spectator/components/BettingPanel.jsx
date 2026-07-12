import { Badge } from "@/common/ui";
import { canPredict, estimatedReturn } from "../constants";
import { PREDICTION_TYPE_OPTIONS } from "../constants";
function BettingPanel({
  raceStatus,
  selectionLabel,
  oddsLabel,
  oddsMultiplier,
  stake,
  onStakeChange,
  predictionType = "WIN",
  onTypeChange,
  onConfirm,
  submitting
}) {
  const open = canPredict(raceStatus);
  const est = estimatedReturn(stake, oddsMultiplier ?? 0);
  return <div className="rounded-2xl bg-brand-900 p-5 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-50/80">Potential Rewards</p>

      <div className="mt-4 rounded-xl bg-white/10 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">Current Selection</p>
        <p className="mt-1 text-lg font-semibold">{selectionLabel ?? "No runner selected"}</p>
        <p className="text-sm text-brand-50/80">Odds: {oddsLabel ?? "\u2014"}</p>
      </div>

      {!open ? <div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-4 text-center">
          <Badge tone="danger">Betting closed</Badge>
          <p className="mt-2 text-sm text-white/80">
            This race has started — predictions are locked once the pool closes.
          </p>
        </div> : <>
          {onTypeChange && <div className="mt-4">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-white/60">Bet Type</p>
              <div className="flex flex-wrap gap-1.5">
                {PREDICTION_TYPE_OPTIONS.map((o) => <button
    key={o.value}
    type="button"
    onClick={() => onTypeChange(o.value)}
    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${predictionType === o.value ? "bg-white text-brand-900" : "bg-white/10 text-white hover:bg-white/20"}`}
  >
                    {o.label}
                  </button>)}
              </div>
            </div>}

          <div className="mt-4">
            <label htmlFor="stake" className="mb-1.5 block text-xs uppercase tracking-wide text-white/60">
              Stake (Tokens)
            </label>
            <input
    id="stake"
    type="number"
    min={1}
    value={stake || ""}
    onChange={(e) => onStakeChange(Number(e.target.value))}
    className="h-11 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
    placeholder="Enter stake"
  />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-4">
            <span className="text-sm text-white/70">Estimated Return</span>
            <span className="text-xl font-bold tabular-nums">{est.toLocaleString("vi-VN")}</span>
          </div>

          <button
    type="button"
    onClick={onConfirm}
    disabled={submitting || !selectionLabel || !(stake > 0)}
    className="mt-4 h-12 w-full rounded-xl bg-white text-sm font-bold text-brand-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
  >
            {submitting ? "Submitting\u2026" : "CONFIRM PREDICTION"}
          </button>
        </>}
    </div>;
}
export {
  BettingPanel
};
