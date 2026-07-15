import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Pencil, Plus, Trophy } from "lucide-react";
import { Badge, Button, Card, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useRaces, useTournament, useTournaments } from "../hooks";
import { TournamentAdvanceButton } from "../components/TournamentAdvanceButton";
import { TournamentBuilderModal } from "../components/TournamentBuilderModal";
import { TournamentRefereePanel } from "../components/TournamentRefereePanel";
import { RaceFormModal } from "../components/RaceFormModal";
import { RaceDetailModal } from "../components/RaceDetailModal";
import { RACE_STATUS_LABEL, RACE_STATUS_TONE, TOURNAMENT_STATUS_TONE } from "../constants";
function TournamentDetailPage() {
  const { tournamentId = "" } = useParams();
  const navigate = useNavigate();
  const tQuery = useTournament(tournamentId);
  const racesQuery = useRaces({ tournamentId, size: 100 });
  const tournamentsQuery = useTournaments({});
  const [editing, setEditing] = useState(false);
  const [addingRace, setAddingRace] = useState(false);
  const [openRace, setOpenRace] = useState(null);
  const t = tQuery.data;
  const races = racesQuery.data?.rows ?? [];
  const tournaments = tournamentsQuery.data?.rows ?? [];
  const entries = t?.registeredEntriesCount ?? t?.registeredEntries ?? null;
  return <>
      <button
    type="button"
    onClick={() => navigate("/admin/tournaments")}
    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
  >
        <ArrowLeft size={16} /> All Tournaments
      </button>

      {
    /* Tournament hero */
  }
      {tQuery.isPending ? <Skeleton className="h-48 w-full rounded-2xl" /> : tQuery.isError || !t ? <Card><CardBody><EmptyState title="Couldn't load tournament" description="It may have been removed. Go back to the list." /></CardBody></Card> : <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 to-green-700">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative flex flex-wrap items-center gap-2 p-5">
            <Badge tone={TOURNAMENT_STATUS_TONE[t.status]}>{t.status.replace(/_/g, " ")}</Badge>
            {t.circuitTier && <span className="text-xs font-medium text-white/70">{t.circuitTier.replace(/_/g, " ")}</span>}
            <span className="ml-auto text-xs text-white/50">{t.tournamentCode}</span>
          </div>
          <div className="relative flex h-12 items-center justify-center sm:h-16">
            <Trophy size={36} className="text-white/10" />
          </div>
          <div className="relative p-5 pt-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white sm:text-2xl">{t.name}</h1>
                {t.location && <p className="mt-0.5 text-sm text-white/60">{t.location}</p>}
                {t.description && <p className="mt-1 max-w-2xl text-sm text-white/50">{t.description}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
                <TournamentAdvanceButton tournamentId={t.tournamentId} status={t.status} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4 sm:flex sm:flex-wrap sm:gap-8">
              <div>
                <p className="text-xs text-white/50">Total Purse</p>
                <p className="text-lg font-semibold text-white">{t.totalPurse != null ? `$${t.totalPurse.toLocaleString()}` : "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Registered Entries</p>
                <p className="text-lg font-semibold text-white">{entries ?? "\u2014"}{t.entryCap != null ? ` / ${t.entryCap}` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Dates</p>
                <p className="text-lg font-semibold text-white">
                  {t.startDate ? formatDate(t.startDate) : "\u2014"}{t.endDate ? ` \u2192 ${formatDate(t.endDate)}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/50">Races</p>
                <p className="text-lg font-semibold text-white">{races.length}</p>
              </div>
            </div>
          </div>
        </div>}

      {
    /* Races for this tournament */
  }
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Races</h2>
        <Button size="sm" disabled={!t} onClick={() => setAddingRace(true)}><Plus size={15} /> Add Race</Button>
      </div>

      <Card className="mt-3">
        <CardBody className="p-0">
          {racesQuery.isPending ? <div className="flex flex-col gap-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div> : racesQuery.isError ? <EmptyState title="Couldn't load races" description="Please reload the page." /> : races.length === 0 ? <EmptyState title="No races yet" description="Add the first race for this tournament." /> : <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Race</th>
                    <th className="px-4 py-3 font-medium">Date / Time</th>
                    <th className="px-4 py-3 font-medium">Participants</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {races.map((r) => <tr
    key={r.raceId}
    className="cursor-pointer hover:bg-subtle/40"
    onClick={() => setOpenRace(r)}
  >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><CalendarDays size={15} /></div>
                          <div>
                            <p className="font-medium text-ink">{r.name ?? r.raceCode}</p>
                            <p className="text-xs text-muted">{r.raceCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{r.scheduledStartAt ? formatDate(r.scheduledStartAt) : "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{r.entriesCount ?? 0} / {r.maxParticipants ?? "\u2014"}</td>
                      <td className="px-4 py-3"><Badge tone={RACE_STATUS_TONE[r.status]}>{RACE_STATUS_LABEL[r.status] ?? r.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="secondary" onClick={(e) => {
    e.stopPropagation();
    setOpenRace(r);
  }}>Open</Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </CardBody>
      </Card>

      {
    /* Tournament-level referee invitations */
  }
      {t && <TournamentRefereePanel tournamentId={t.tournamentId} />}

      {editing && t && <TournamentBuilderModal tournament={t} onClose={() => setEditing(false)} />}
      {addingRace && t && <RaceFormModal mode="create" tournaments={tournaments} lockedTournamentId={t.tournamentId} onClose={() => setAddingRace(false)} />}
      {openRace && <RaceDetailModal raceId={openRace.raceId} fallback={openRace} tournaments={tournaments} onClose={() => setOpenRace(null)} />}
    </>;
}
export {
  TournamentDetailPage as default
};
