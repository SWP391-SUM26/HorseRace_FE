import { LineChart } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader } from '@/common/ui';
import type { HistoricalWin } from '../types';

interface Props {
  wins: HistoricalWin[];
  onViewAnalytics: () => void;
}

export function HistoricalWins({ wins, onViewAnalytics }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <h2 className="text-base font-semibold text-ink">Historical Wins</h2>
      </CardHeader>
      <CardBody className="flex flex-1 flex-col gap-3">
        <ul className="flex flex-col divide-y divide-border">
          {wins.map((w) => (
            <li key={`${w.horse}-${w.year}`} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-ink">
                  {w.horse} <span className="text-muted">({w.year})</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-ink">{w.time}</span>
                {w.record && <Badge tone="warning">Record</Badge>}
              </div>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          size="sm"
          className="mt-auto self-start"
          leftIcon={<LineChart className="h-4 w-4" />}
          onClick={onViewAnalytics}
        >
          View Deep Analytics
        </Button>
      </CardBody>
    </Card>
  );
}
