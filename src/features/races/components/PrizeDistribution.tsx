import { Card, CardBody, CardHeader } from '@/common/ui';
import type { PrizeTier } from '../types';

interface Props {
  tiers: PrizeTier[];
  totalPurse: string;
}

export function PrizeDistribution({ tiers, totalPurse }: Props) {
  const max = Math.max(...tiers.map((t) => t.amount), 1);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <h2 className="text-base font-semibold text-ink">Prize Money Distribution</h2>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-4">
        <div className="flex flex-1 items-end gap-3">
          {tiers.map((t) => (
            <div key={t.place} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold tabular-nums text-ink">{t.label}</span>
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-brand-700"
                  style={{ height: `${Math.max((t.amount / max) * 100, 6)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted">{t.place}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total Purse</span>
            <span className="text-base font-bold text-ink">{totalPurse}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Dividends processed within 48h post-race</p>
        </div>
      </CardBody>
    </Card>
  );
}
