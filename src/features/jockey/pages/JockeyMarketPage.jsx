import { useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal, Zap } from "lucide-react";
import { Button, EmptyState, Skeleton } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import {
  useEntryId,
  useJockeys,
  useJockeySuggestions,
  useRaceDetail,
  useSendInvitation,
  useUnassignedEntries
} from "../hooks_owner";
import { JockeyCard } from "../components/JockeyCard";
import { RaceDetails } from "../components/RaceDetails";
import { UnassignedHorses } from "../components/UnassignedHorses";
function JockeyMarketPage() {
  const toast = useToast();
  const { data: entries, isPending: entriesPending } = useUnassignedEntries();
  const [selectedId, setSelectedId] = useState(null);
  const selectedEntry = useMemo(() => {
    if (!entries || entries.length === 0) return void 0;
    return entries.find((e) => e.id === selectedId) ?? entries[0];
  }, [entries, selectedId]);
  const raceId = selectedEntry?.raceId ?? "";
  const horseId = selectedEntry?.horseId ?? "";
  const { data: jockeys, isPending: jockeysPending, isError: jockeysError } = useJockeys();
  const { data: suggestions } = useJockeySuggestions(raceId, horseId);
  const { data: raceDetail } = useRaceDetail(raceId);
  const jockeyCards = useMemo(() => {
    if (!jockeys) return [];
    const byId = new Map((suggestions ?? []).map((s) => [s.jockeyUserId, s.compatibility]));
    return jockeys.map((j) => ({ ...j, compatibility: byId.get(j.userId) ?? null }));
  }, [jockeys, suggestions]);
  const entryId = useEntryId(raceId, horseId);
  const invite = useSendInvitation();
  const handleInvite = (jockeyUserId, name) => {
    if (!entryId.data) {
      toast.error("Ch\u01B0a x\xE1c \u0111\u1ECBnh \u0111\u01B0\u1EE3c su\u1EA5t \u0111ua c\u1EE7a ng\u1EF1a");
      return;
    }
    invite.mutate(
      { entryId: entryId.data, jockeyUserId },
      {
        onSuccess: () => toast.success(`\u0110\xE3 g\u1EEDi l\u1EDDi m\u1EDDi t\u1EDBi ${name}`),
        onError: (e) => {
          const status = e?.response?.status;
          toast.error(
            status === 409 ? "\u0110\xE3 m\u1EDDi n\xE0i n\xE0y cho su\u1EA5t \u0111ua n\xE0y r\u1ED3i" : "G\u1EEDi l\u1EDDi m\u1EDDi th\u1EA5t b\u1EA1i"
          );
        }
      }
    );
  };
  const handleQuickAssign = () => {
    if (!entryId.data || !jockeyCards.length) {
      toast.error("Ch\u01B0a c\xF3 d\u1EEF li\u1EC7u \u0111\u1EC3 g\xE1n nhanh");
      return;
    }
    const best = [...jockeyCards].sort(
      (a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0)
    )[0];
    handleInvite(best.userId, best.fullName);
  };
  return <div className="flex flex-col gap-6">
      {
    /* Header */
  }
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
        {
    /* Left rail */
  }
        <div className="flex flex-col gap-6">
          {entriesPending ? <Skeleton className="h-56 w-full rounded-2xl" /> : !entries || entries.length === 0 ? <EmptyState title="Chưa có ngựa cần gán nài" /> : <UnassignedHorses
    entries={entries}
    selectedId={selectedEntry?.id ?? ""}
    onSelect={setSelectedId}
  />}
          {raceDetail && <RaceDetails detail={raceDetail} />}
        </div>

        {
    /* Right column */
  }
        <div className="flex flex-col gap-4 lg:col-span-2">
          {
    /* Filter bar */
  }
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
              Showing {jockeysPending ? "\u2014" : jockeyCards.length} available jockeys
            </p>
          </div>

          {
    /* Jockey cards */
  }
          {jockeysPending ? <JockeyListSkeleton /> : jockeysError ? <EmptyState
    title="Không tải được danh sách nài"
    description="Vui lòng thử lại sau."
  /> : jockeyCards.length === 0 ? <EmptyState title="Chưa có nài nào khả dụng" /> : jockeyCards.map((jockey, i) => <JockeyCard
    key={jockey.id}
    jockey={jockey}
    primary={i === 0}
    disabled={!entryId.data || invite.isPending}
    onInvite={handleInvite}
  />)}
        </div>
      </div>
    </div>;
}
function JockeyListSkeleton() {
  return <div className="flex flex-col gap-4">
      {[0, 1].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
    </div>;
}
export {
  JockeyMarketPage as default
};
