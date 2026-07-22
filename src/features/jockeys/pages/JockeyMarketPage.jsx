import { useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal, Zap } from "lucide-react";
import { Button, EmptyState, Skeleton, Tabs } from "@/common/ui";
import { useToast } from "@/common/providers/ToastProvider";
import { useWallet } from "@/features/wallet/hooks";
import { formatMoney } from "@/common/lib/format";
import { useAuth } from "@/common/hooks/useAuth";
import {
  useEntryId,
  useJockeys,
  useJockeySuggestions,
  useMyInvitations,
  useRaceDetail,
  useSendInvitation,
  useUnassignedEntries,
} from "../hooks";
import { JockeyCard } from "../components/JockeyCard";
import { RaceDetails } from "../components/RaceDetails";
import { UnassignedHorses } from "../components/UnassignedHorses";
import { OwnerInvitationsPanel } from "../components/OwnerInvitationsPanel";

const TABS = [
  { key: "find", label: "Find Jockeys" },
  { key: "invitations", label: "My Invitations" },
];

export default function JockeyMarketPage() {
  const toast = useToast();
  const [tab, setTab] = useState("find");

  const { user } = useAuth();
  const { data: entries, isPending: entriesPending } = useUnassignedEntries();
  const { data: invitations } = useMyInvitations(user?.id ?? "");
  const [selectedId, setSelectedId] = useState(null);

  // An entry can hold only one active invitation (BE: ENTRY_ALREADY_ASSIGNED). Once a horse
  // has an INVITED/ACCEPTED jockey it can't take another invite, so it disappears from the
  // rail — reappearing only if that invitation is later cancelled or declined.
  const invitedEntryKeys = useMemo(() => {
    if (!invitations) return new Set();
    return new Set(
      invitations
        .filter((i) => i.status === "INVITED" || i.status === "ACCEPTED")
        .map((i) => `${i.raceId}:${i.horseId}`),
    );
  }, [invitations]);

  const availableEntries = useMemo(
    () =>
      (entries ?? []).filter(
        (e) => !invitedEntryKeys.has(`${e.raceId}:${e.horseId}`),
      ),
    [entries, invitedEntryKeys],
  );

  const selectedEntry = useMemo(() => {
    if (availableEntries.length === 0) return undefined;
    return (
      availableEntries.find((e) => e.id === selectedId) ?? availableEntries[0]
    );
  }, [availableEntries, selectedId]);

  const raceId = selectedEntry?.raceId ?? "";
  const horseId = selectedEntry?.horseId ?? "";

  const {
    data: jockeys,
    isPending: jockeysPending,
    isError: jockeysError,
  } = useJockeys();
  const { data: suggestions } = useJockeySuggestions(raceId, horseId);
  const { data: raceDetail } = useRaceDetail(raceId);

  const entryId = useEntryId(raceId, horseId);
  const invite = useSendInvitation();
  const wallet = useWallet();

  /**
   * Merge BE suggestions (compatibility + eligibility) into the jockey list. When a horse is
   * selected, show only the eligible jockeys who can still receive an invitation for it.
   */
  const jockeyCards = useMemo(() => {
    if (!jockeys) return [];
    const byId = new Map((suggestions ?? []).map((s) => [s.jockeyUserId, s]));
    const merged = jockeys.map((j) => {
      const s = byId.get(j.userId);
      return {
        ...j,
        compatibility: s?.compatibility ?? null,
        eligible: s?.eligible ?? true,
      };
    });
    const horseSelected = !!raceId && !!horseId;
    return horseSelected && suggestions
      ? merged.filter((c) => byId.has(c.userId) && c.eligible)
      : merged;
  }, [jockeys, suggestions, raceId, horseId]);

  const handleInvite = (jockeyUserId, name) => {
    if (!entryId.data) {
      toast.error("Couldn't determine this horse's race entry");
      return;
    }
    // Hiring commits real money: the fee is locked out of the owner's wallet the moment the
    // invitation is sent, and only reaches the jockey once the race has been certified. Check it
    // here so the owner is told why, rather than being handed a bare 400 from the server.
    const jockey = jockeyCards.find((j) => j.userId === jockeyUserId);
    const fee = jockey?.baseFeeAmount ?? null;
    const balance = wallet.data?.balance ?? 0;
    if (fee != null && fee > 0 && !wallet.isPending && balance < fee) {
      toast.error(
        `Not enough balance — hiring ${name} costs ${formatMoney(fee)} and you have ${formatMoney(balance)}.`,
      );
      return;
    }
    invite.mutate(
      { entryId: entryId.data, jockeyUserId, agreedBaseFee: fee ?? undefined },
      {
        onSuccess: () =>
          toast.success(
            fee != null && fee > 0
              ? `Invitation sent to ${name} — ${formatMoney(fee)} is held until the race is run.`
              : `Invitation sent to ${name}`,
          ),
      },
    );
  };

  const handleQuickAssign = () => {
    if (!entryId.data || !jockeyCards.length) {
      toast.error("No data available to quick-assign");
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
          <h1 className="mt-1 text-3xl font-semibold text-ink">
            Jockey Selection
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Review open race entries and invite elite jockeys to ride your
            stable&apos;s champions.
          </p>
        </div>
        {tab === "find" && (
          <Button
            leftIcon={<Zap className="h-4 w-4" />}
            onClick={handleQuickAssign}
            className="shrink-0"
          >
            Quick Assign All
          </Button>
        )}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "invitations" ? (
        <OwnerInvitationsPanel />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left rail */}
          <div className="flex flex-col gap-6">
            {entriesPending ? (
              <Skeleton className="h-56 w-full rounded-2xl" />
            ) : availableEntries.length === 0 ? (
              <EmptyState
                title="No horses awaiting a jockey"
                description="Every entered horse already has a jockey invited."
              />
            ) : (
              <UnassignedHorses
                entries={availableEntries}
                selectedId={selectedEntry?.id ?? ""}
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
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                >
                  Sort: Best Match
                </Button>
                <Button variant="ghost" size="sm">
                  Distance
                </Button>
              </div>
              <p className="text-sm text-muted">
                Showing {jockeysPending ? "—" : jockeyCards.length} available
                jockeys
              </p>
            </div>

            {/* Jockey cards */}
            {jockeysPending ? (
              <JockeyListSkeleton />
            ) : jockeysError ? (
              <EmptyState
                title="Couldn't load jockeys"
                description="Please try again later."
              />
            ) : jockeyCards.length === 0 ? (
              <EmptyState title="No jockeys available" />
            ) : (
              jockeyCards.map((jockey) => (
                <JockeyCard
                  key={jockey.id}
                  jockey={jockey}
                  disabled={!entryId.data || invite.isPending}
                  onInvite={handleInvite}
                />
              ))
            )}
          </div>
        </div>
      )}
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
