import { useMemo, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { Badge, Card, CardBody, EmptyState, Skeleton } from '@/common/ui';
import { cn } from '@/common/lib/cn';
import { formatDate } from '@/common/lib/format';
import { useRaceCalendar, useOwnerRaceIds, useRefereeRaceIds } from '../hooks';
import { RaceReportView } from '../components/RaceReportView';
import type { RaceCalendarRow } from '../api';

const REPORTABLE = new Set(['FINISHED', 'OFFICIAL']);

const COPY: Record<string, { title: string; subtitle: string }> = {
  owner: { title: 'Race Results', subtitle: "Results and stewards' reports for races your horses ran in." },
  admin: { title: 'Race Reports', subtitle: 'Results, stewards’ reports and violations across every race.' },
  referee: { title: 'Race Reports', subtitle: 'Published results and reports for completed races.' },
};

function statusTone(s: string): 'success' | 'neutral' {
  return s === 'OFFICIAL' ? 'success' : 'neutral';
}

export default function RaceReportPage({ scope }: { scope: 'owner' | 'admin' | 'referee' }) {
  const { data: allRaces, isPending } = useRaceCalendar();
  const ownerIds = useOwnerRaceIds();
  const refereeIds = useRefereeRaceIds();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // owner = their horses' races; referee = admin-assigned races; admin = all races.
  const restricted = scope === 'owner' || scope === 'referee';
  const restrictIds = scope === 'owner' ? ownerIds.data : scope === 'referee' ? refereeIds.data : undefined;
  const ownerPending = restricted && restrictIds === undefined;

  const races = useMemo(() => {
    let list = (allRaces ?? []).filter((r) => REPORTABLE.has(r.status));
    if (restricted) {
      const ids = new Set(restrictIds ?? []);
      list = list.filter((r) => ids.has(r.raceId));
    }
    return [...list].sort((a, b) => +new Date(b.scheduledStartAt ?? 0) - +new Date(a.scheduledStartAt ?? 0));
  }, [allRaces, restricted, restrictIds]);

  const selected = races.find((r) => r.raceId === selectedId) ?? races[0];
  const copy = COPY[scope];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
      </div>

      {isPending || ownerPending ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : races.length === 0 ? (
        <Card><CardBody><EmptyState title="No completed races yet" description="Reports appear once races finish and results are recorded." /></CardBody></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Race picker */}
          <div className="flex flex-col gap-3 lg:col-span-1">
            {races.map((r) => (
              <RaceRow key={r.raceId} race={r} active={selected?.raceId === r.raceId} onSelect={() => setSelectedId(r.raceId)} />
            ))}
          </div>

          {/* Report */}
          <div className="lg:col-span-2">
            {selected ? <RaceReportView raceId={selected.raceId} canCertify={scope === 'admin'} /> : <Card><CardBody><EmptyState title="Select a race" description="Pick a race to view its report." /></CardBody></Card>}
          </div>
        </div>
      )}
    </div>
  );
}

function RaceRow({ race, active, onSelect }: { race: RaceCalendarRow; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'rounded-2xl border bg-surface p-4 text-left transition-colors',
        active ? 'border-brand-700 ring-1 ring-brand-700' : 'border-border hover:border-brand-700/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate font-semibold text-ink">{race.name}</h3>
        <Badge tone={statusTone(race.status)}>{race.status === 'OFFICIAL' ? 'OFFICIAL' : 'FINISHED'}</Badge>
      </div>
      {race.tournamentName && <p className="mt-0.5 truncate text-xs text-muted">{race.tournamentName}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {race.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{race.venue}</span>}
        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{race.scheduledStartAt ? formatDate(race.scheduledStartAt) : '—'}</span>
      </div>
    </button>
  );
}
