import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Avatar, Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton } from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import { useRaces, useRegistrations, useTournament, useTournaments } from "../hooks";
import { TournamentAdvanceButton } from "../components/TournamentAdvanceButton";
import { TournamentBuilderModal } from "../components/TournamentBuilderModal";
import { RaceFormModal } from "../components/RaceFormModal";
import { RaceDetailModal } from "../components/RaceDetailModal";
import { RegistrationDetailModal } from "../components/RegistrationDetailModal";
import { TOURNAMENT_STATUS_FILTERS, RACE_STATUS_TONE, RACE_STATUS_LABEL, REGISTRATION_STATUS_TONE } from "../constants";
import heroHorses from "@/assets/hero-horses.png";
import silverStreak from "@/assets/silver-streak.png";
import authHorse from "@/assets/auth-horse.jpg";
import jockeyImg from "@/assets/jockey.png";
const IMAGES = [heroHorses, silverStreak, authHorse, jockeyImg];
const imageFor = (i) => IMAGES[i % IMAGES.length];
function statusDisplay(s) {
  switch (s) {
    case "ONGOING":
      return { label: "LIVE", tone: "danger" };
    case "REGISTRATION_OPEN":
      return { label: "REGISTRATION", tone: "success" };
    case "PUBLISHED":
      return { label: "UPCOMING", tone: "info" };
    case "REGISTRATION_CLOSED":
      return { label: "CLOSED", tone: "warning" };
    case "COMPLETED":
      return { label: "COMPLETED", tone: "neutral" };
    case "DRAFT":
      return { label: "DRAFT", tone: "neutral" };
    case "CANCELLED":
      return { label: "CANCELLED", tone: "danger" };
    default:
      return { label: s.replace(/_/g, " "), tone: "neutral" };
  }
}
function fmtTime(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "\u2014" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
const purse = (n) => n != null ? `$${n.toLocaleString()}` : "\u2014";
const PAGE_SIZE = 4;
function TournamentOrchestrationPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const listQuery = useTournaments({ status: status || void 0 });
  const tournaments = listQuery.data?.rows ?? [];
  const selected = useMemo(() => {
    if (tournaments.length === 0) return null;
    return tournaments.find((t) => t.tournamentId === selectedId) ?? tournaments[0];
  }, [tournaments, selectedId]);
  const filtered = useMemo(
    () => tournaments.filter((t) => `${t.name} ${t.tournamentCode}`.toLowerCase().includes(q.trim().toLowerCase())),
    [tournaments, q]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages - 1);
  const paged = filtered.slice(pageClamped * PAGE_SIZE, pageClamped * PAGE_SIZE + PAGE_SIZE);
  return <>
      <PageHeader
    title="Tournament Catalog"
    subtitle="Create, publish and manage racing events, their races and entries."
    actions={<Button onClick={() => setCreating(true)}><Plus size={16} /> New Tournament</Button>}
  />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full flex-1 sm:max-w-xs">
          <Input value={q} onChange={(e) => {
    setQ(e.target.value);
    setPage(0);
  }} placeholder="Search tournaments…" />
        </div>
        <div className="w-full sm:w-52">
          <Select value={status} onChange={(e) => {
    setStatus(e.target.value);
    setPage(0);
  }} options={TOURNAMENT_STATUS_FILTERS} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {
    /* Catalog */
  }
        <div className="lg:col-span-2">
          {listQuery.isPending ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div> : listQuery.isError ? <Card><CardBody><EmptyState title="Couldn't load tournaments" description="Please reload the page." /></CardBody></Card> : filtered.length === 0 ? <Card><CardBody><EmptyState title="No tournaments" description={q ? "No events match your search." : "Create your first tournament."} /></CardBody></Card> : <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {paged.map((t, i) => <CatalogCard key={t.tournamentId} t={t} index={pageClamped * PAGE_SIZE + i} active={selected?.tournamentId === t.tournamentId} onSelect={() => setSelectedId(t.tournamentId)} />)}
              </div>
              {totalPages > 1 && <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => <Button key={i} size="sm" variant={pageClamped === i ? "primary" : "ghost"} onClick={() => setPage(i)}>{i + 1}</Button>)}
                </div>}
            </>}
        </div>

        {
    /* Featured / management */
  }
        <div className="lg:col-span-3">
          {selected ? <DetailPanel key={selected.tournamentId} tournament={selected} /> : <Card><CardBody><EmptyState title="Select a tournament" description="Pick an event to manage it." /></CardBody></Card>}
        </div>
      </div>

      {creating && <TournamentBuilderModal tournament={null} onClose={() => setCreating(false)} onCreated={setSelectedId} />}
    </>;
}
function CatalogCard({ t, index, active, onSelect }) {
  const s = statusDisplay(t.status);
  return <button
    type="button"
    onClick={onSelect}
    className={cn("overflow-hidden rounded-2xl border bg-surface text-left transition-colors", active ? "border-brand-700 ring-1 ring-brand-700" : "border-border hover:border-brand-700/50")}
  >
      <div className="relative h-28 w-full">
        <img src={t.imageUrl || imageFor(index)} alt="" className="h-28 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute right-2 top-2"><Badge tone={s.tone}>{s.label}</Badge></span>
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold text-ink">{t.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted"><CalendarDays size={12} />{t.startDate ? formatDate(t.startDate) : "\u2014"} · {t.tournamentCode}</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">Prize Pool</p>
            <p className="text-sm font-semibold text-ink">{purse(t.totalPurse)}</p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700"><ChevronRight size={16} /></span>
        </div>
      </div>
    </button>;
}
function DetailPanel({ tournament }) {
  const navigate = useNavigate();
  const detailQuery = useTournament(tournament.tournamentId);
  const racesQuery = useRaces({ tournamentId: tournament.tournamentId, size: 100 });
  const entriesQuery = useRegistrations({ tournamentId: tournament.tournamentId, size: 100 });
  const [editing, setEditing] = useState(false);
  const [addingRace, setAddingRace] = useState(false);
  const [openRace, setOpenRace] = useState(null);
  const [openReg, setOpenReg] = useState(null);
  const t = detailQuery.data ?? tournament;
  const races = useMemo(
    () => [...racesQuery.data?.rows ?? []].sort((a, b) => (a.scheduledStartAt ?? "").localeCompare(b.scheduledStartAt ?? "")),
    [racesQuery.data]
  );
  const entries = (entriesQuery.data?.rows ?? []).filter((r) => r.status !== "WITHDRAWN" && r.status !== "REJECTED" && r.status !== "REMOVED");
  const s = statusDisplay(t.status);
  const entriesCount = t.registeredEntriesCount ?? t.registeredEntries ?? entries.length;
  const maxEntries = Math.max(1, ...races.map((r) => r.entriesCount ?? 0));
  return <Card className="overflow-hidden">
      {
    /* Hero */
  }
      <div className="relative h-44 w-full">
        <img src={t.imageUrl || heroHorses} alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute right-4 top-4 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
          <TournamentAdvanceButton tournamentId={t.tournamentId} status={t.status} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={s.tone}>{s.label}</Badge>
            {t.circuitTier && <span className="text-xs font-medium text-white/70">{t.circuitTier.replace(/_/g, " ")}</span>}
            <span className="text-xs text-white/60">{t.tournamentCode}</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white">{t.name}</h2>
          {t.location && <p className="text-sm text-white/70">{t.location}</p>}
        </div>
      </div>

      <CardBody className="flex flex-col gap-6">
        {
    /* Stats */
  }
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total Purse" value={purse(t.totalPurse)} />
          <Stat label="Entries" value={`${entriesCount}${t.entryCap != null ? ` / ${t.entryCap}` : ""}`} />
          <Stat label="Dates" value={`${t.startDate ? formatDate(t.startDate) : "\u2014"}${t.endDate ? ` \u2192 ${formatDate(t.endDate)}` : ""}`} />
          <Stat label="Races" value={races.length} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {
    /* Race schedule (manage) */
  }
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Race Schedule</p>
              <Button size="sm" variant="secondary" onClick={() => setAddingRace(true)}><Plus size={13} /> Add Race</Button>
            </div>
            {racesQuery.isPending ? <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}</div> : races.length === 0 ? <p className="text-sm text-muted">No races yet.</p> : <ul className="flex flex-col gap-2">
                {races.slice(0, 6).map((r) => <li key={r.raceId}>
                    <button type="button" onClick={() => setOpenRace(r)} className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2 text-left hover:bg-subtle/50">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", r.status === "RUNNING" || r.status === "OPEN" ? "bg-brand-700" : "bg-border")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{r.name ?? r.raceCode}</p>
                        <p className="text-xs text-muted">{fmtTime(r.scheduledStartAt)}</p>
                      </div>
                      <Badge tone={RACE_STATUS_TONE[r.status] ?? "neutral"}>{RACE_STATUS_LABEL[r.status] ?? r.status}</Badge>
                    </button>
                  </li>)}
              </ul>}
          </div>

          {
    /* Entries (review) */
  }
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Entries</p>
              <span className="text-xs text-muted">{entries.length} Total</span>
            </div>
            {entriesQuery.isPending ? <div className="flex flex-col gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div> : entries.length === 0 ? <p className="text-sm text-muted">No entrants yet.</p> : <ul className="flex flex-col gap-2">
                {entries.slice(0, 5).map((e) => <li key={e.registrationId}>
                    <button type="button" onClick={() => setOpenReg(e)} className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left hover:bg-subtle/50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{e.horseName ?? "\u2014"}</p>
                        <p className="truncate text-xs text-muted">Owner: {e.ownerName ?? "\u2014"}</p>
                      </div>
                      <Badge tone={REGISTRATION_STATUS_TONE[e.status]}>{e.status.replace(/_/g, " ")}</Badge>
                      <Avatar name={e.ownerName ?? "\u2014"} size={24} />
                    </button>
                  </li>)}
              </ul>}
          </div>
        </div>

        {
    /* Entries per race */
  }
        {races.length > 0 && <div className="rounded-xl bg-subtle/40 p-4">
            <p className="mb-3 text-sm font-semibold text-ink">Entries per Race</p>
            <div className="flex h-24 items-end gap-2">
              {races.slice(0, 10).map((r) => <div key={r.raceId} className="flex-1" title={`${r.name ?? r.raceCode}: ${r.entriesCount ?? 0}`}>
                  <div className="w-full rounded-t bg-brand-700/70" style={{ height: `${Math.max(6, (r.entriesCount ?? 0) / maxEntries * 100)}%` }} />
                </div>)}
            </div>
          </div>}

        <button type="button" onClick={() => navigate(`/admin/tournaments/${t.tournamentId}`)} className="self-start text-sm font-medium text-brand-700 hover:underline">
          Open full management page →
        </button>
      </CardBody>

      {editing && <TournamentBuilderModal tournament={t} onClose={() => setEditing(false)} />}
      {addingRace && <RaceFormModal mode="create" tournaments={[{ tournamentId: t.tournamentId, name: t.name }]} lockedTournamentId={t.tournamentId} onClose={() => setAddingRace(false)} />}
      {openRace && <RaceDetailModal raceId={openRace.raceId} fallback={openRace} tournaments={[{ tournamentId: t.tournamentId, name: t.name }]} onClose={() => setOpenRace(null)} />}
      {openReg && <RegistrationDetailModal registration={openReg} onClose={() => setOpenReg(null)} />}
    </Card>;
}
function Stat({ label, value }) {
  return <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>;
}
export {
  TournamentOrchestrationPage as default
};
