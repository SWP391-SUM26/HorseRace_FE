import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Avatar, Badge } from '@/common/ui';
import { usd } from '../format';
import type { HorseSummary } from '../types';

const STABLE_PATH = '/app/owner/stable';

export function StableSummary({ horses }: { horses: HorseSummary[] }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">My Stable</h2>
        <Link to={STABLE_PATH} className="text-sm text-brand-700 hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardBody className="flex flex-col gap-1 p-2">
        {horses.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">Chưa có ngựa trong chuồng.</p>
        )}
        {horses.map((horse) => (
          <button
            key={horse.id}
            type="button"
            onClick={() => navigate(STABLE_PATH)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-subtle"
          >
            <Avatar name={horse.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{horse.name}</p>
              <p className="text-xs text-muted">ID #{horse.registrationId}</p>
            </div>
            <Badge tone={horse.status === 'Active' ? 'success' : 'neutral'}>{horse.status}</Badge>
            <span className="w-24 text-right text-sm font-medium text-ink">{usd(horse.earnings)}</span>
          </button>
        ))}
      </CardBody>
    </Card>
  );
}
