import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, DataTable } from '@/common/ui';
import { cn } from '@/common/lib/cn';
import type { Column } from '@/common/ui';
import type { EntryRow } from '../types';

interface Props {
  entries: EntryRow[];
  expanded: boolean;
  onToggle: () => void;
}

const COLLAPSED_COUNT = 3;

export function OfficialEntries({ entries, expanded, onToggle }: Props) {
  const visible = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
  const hidden = entries.length - COLLAPSED_COUNT;

  const columns: Column<EntryRow>[] = [
    {
      key: 'no',
      header: 'No.',
      className: 'w-12',
      render: (r) => <span className="font-semibold tabular-nums text-ink">{r.entryNo}</span>,
    },
    {
      key: 'horse',
      header: 'Horse (Trainer)',
      render: (r) => (
        <div>
          <span className="font-semibold text-ink">{r.horseName}</span>
          {r.yours && <span className="ml-1.5 text-xs font-semibold text-brand-700">(YOURS)</span>}
          <p className="text-xs text-muted">{r.trainer}</p>
        </div>
      ),
    },
    { key: 'jockey', header: 'Jockey', render: (r) => <span className="text-ink">{r.jockey}</span> },
    {
      key: 'weight',
      header: 'Weight',
      render: (r) => <span className="tabular-nums text-ink">{r.weight}</span>,
    },
    {
      key: 'last5',
      header: 'Last 5 Runs',
      render: (r) => <span className="tabular-nums text-muted">{r.last5}</span>,
    },
    {
      key: 'odds',
      header: 'Odds',
      render: (r) => <span className="font-semibold tabular-nums text-ink">{r.odds}</span>,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-ink">
          Official Entries <span className="font-normal text-muted">({entries.length} runners)</span>
        </h2>
      </CardHeader>
      <DataTable<EntryRow>
        rows={visible}
        columns={columns}
        rowKey={(r) => String(r.entryNo)}
        rowClassName={(r) => (r.yours ? 'bg-brand-50' : undefined)}
        flush
        emptyLabel="No entries yet"
      />
      {hidden > 0 && (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-subtle/60"
        >
          {expanded ? 'Show Fewer Runners' : `Show All Runners (${hidden} more)`}
          <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </Card>
  );
}
