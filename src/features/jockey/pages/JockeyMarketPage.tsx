import { useMemo, useState } from 'react';
import { ChevronRight, SlidersHorizontal, Zap } from 'lucide-react';
import { Button, EmptyState, Skeleton } from '@/common/ui';
import { useToast } from '@/common/providers/ToastProvider';
import {
  useEntryId,
  useJockeys,
  useJockeySuggestions,
  useRaceDetail,
  useSendInvitation,
  useUnassignedEntries,
} from '../hooks_owner';
import { JockeyCard } from '../components/JockeyCard';
import { RaceDetails } from '../components/RaceDetails';
import { UnassignedHorses } from '../components/UnassignedHorses';
import type { JockeyCard as JockeyCardModel } from '../types_owner';

export default function JockeyMarketPage() {
  const toast = useToast();

  const { data: entries, isPending: entriesPending } = useUnassignedEntries();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedEntry = useMemo(() => {
    if (!entries || entries.length === 0) return undefined;
    return entries.find((e) => e.id === selectedId) ?? entries[0];
  }, [entries, selectedId]);

  const raceId = selectedEntry?.raceId ?? '';
  const horseId = selectedEntry?.horseId ?? '';

  const { data: jockeys, isPending: jockeysPending, isError: jockeysError } = useJockeys();
  const { data: suggestions } = useJockeySuggestions(raceId, horseId);
  const { data: raceDetail } = useRaceDetail(raceId);

  /** Merge BE compatibility scores into the jockey list (null when none). */
  const jockeyCards = useMemo<JockeyCardModel[]>(() => {
    if (!jockeys) return [];
    const byId = new Map((suggestions ?? []).map((s) => [s.jockeyUserId, s.compatibility]));
    return jockeys.map((j) => ({ ...j, compatibility: byId.get(j.userId) ?? null }));
  }, [jockeys, suggestions]);

  const entryId = useEntryId(raceId, horseId);
  const invite = useSendInvitation();

  const handleInvite = (jockeyUserId: string, name: string) => {
    if (!entryId.data) {
      toast.error('Chưa xác định được suất đua của ngựa');
      return;
    }
    invite.mutate(
      { entryId: entryId.data, jockeyUserId },
      {
        onSuccess: () => toast.success(`Đã gửi lời mời tới ${name}`),
        onError: (e) => {
          const status = (e as { response?: { status?: number } })?.response?.status;
          toast.error(
            status === 409 ? 'Đã mời nài này cho suất đua này rồi' : 'Gửi lời mời thất bại',
          );
        },
      },
    );
  };

  const handleQuickAssign = () => {
    if (!entryId.data || !jockeyCards.length) {
      toast.error('Chưa có dữ liệu để gán nhanh');
      return;
    }
    // invite the highest-compatibility jockey to the selected entry
    const best = [...jockeyCards].sort(
      (a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0),
    )[0];
    handleInvite(best.userId, best.fullName);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-sm text-muted">
            <span>Marketplace</span>
            <ChevronRight className="h-4 w-4" />
            <span>Assign Jockeys</span>
          </nav>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Jockey Selection</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Review open race entries and invite elite jockeys to ride your stable&apos;s champions.
          </p>
        </div>
        <Button leftIcon={<Zap className="h-4 w-4" />} onClick={handleQuickAssign} className="shrink-0">
          Quick Assign All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left rail */}
        <div className="flex flex-col gap-6">
          {entriesPending ? (
            <Skeleton className="h-56 w-full rounded-2xl" />
          ) : !entries || entries.length === 0 ? (
            <EmptyState title="Chưa có ngựa cần gán nài" />
          ) : (
            <UnassignedHorses
              entries={entries}
              selectedId={selectedEntry?.id ?? ''}
              onSelect={setSelectedId}
            />
          )}
          {raceDetail && <RaceDetails detail={raceDetail} />}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Filter bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
                Sort: Best Match
              </Button>
              <Button variant="ghost" size="sm">
                Distance
              </Button>
            </div>
            <p className="text-sm text-muted">
              Showing {jockeysPending ? '—' : jockeyCards.length} available jockeys
            </p>
          </div>

          {/* Jockey cards */}
          {jockeysPending ? (
            <JockeyListSkeleton />
          ) : jockeysError ? (
            <EmptyState
              title="Không tải được danh sách nài"
              description="Vui lòng thử lại sau."
            />
          ) : jockeyCards.length === 0 ? (
            <EmptyState title="Chưa có nài nào khả dụng" />
          ) : (
            jockeyCards.map((jockey, i) => (
              <JockeyCard
                key={jockey.id}
                jockey={jockey}
                primary={i === 0}
                disabled={!entryId.data || invite.isPending}
                onInvite={handleInvite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function JockeyListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-56 w-full rounded-2xl" />
      ))}
    </div>
  );
}
