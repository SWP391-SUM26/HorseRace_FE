import { Rabbit as HorseIcon } from 'lucide-react';
import { Badge, Card, CardBody, CardHeader } from '@/common/ui';
import type { YourHorse } from '../types';

interface Props {
  horse: YourHorse | null;
}

export function YourHorseStatus({ horse }: Props) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-ink">Your Horse Status</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {horse ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-subtle text-brand-700">
                <HorseIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{horse.name}</p>
              </div>
              <Badge tone="success">{horse.status}</Badge>
            </div>

            <dl className="divide-y divide-border rounded-xl border border-border">
              {[
                { label: 'Draw Stall', value: horse.drawStall },
                { label: 'Assigned Jockey', value: horse.jockey },
                { label: 'Weight Carried', value: horse.weight },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                  <dt className="text-sm text-muted">{r.label}</dt>
                  <dd className="text-sm font-semibold text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted">Bạn chưa có ngựa trong cuộc đua này</p>
        )}
      </CardBody>
    </Card>
  );
}
