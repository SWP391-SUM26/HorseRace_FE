import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton, StatCard } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useRaceStats, useRaces, useTournaments } from "../hooks";
import { RaceFormModal } from "../components/RaceFormModal";
import { RaceDetailModal } from "../components/RaceDetailModal";
import { RACE_STATUS_FILTERS, RACE_STATUS_LABEL, RACE_STATUS_TONE } from "../constants";
function RaceManagementPage() {
  const [q, setQ] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [openRace, setOpenRace] = useState(null);
  const statsQuery = useRaceStats();
  const listQuery = useRaces({ q: q || void 0, tournamentId: tournamentId || void 0, status: status || void 0, page });
  const tournamentsQuery = useTournaments({});
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const tournaments = tournamentsQuery.data?.rows ?? [];
  const stats = statsQuery.data;
  const tournamentOptions = [{ value: "", label: "All tournaments" }, ...tournaments.map((t) => ({ value: t.tournamentId, label: t.name }))];
  return <>
      <PageHeader
    title="Race Management"
    subtitle="Create, edit, and manage races, schedules, and participants across tournaments."
    actions={<Button onClick={() => setCreating(true)}><Plus size={16} /> Create Race</Button>}
  />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />) : <>
            <StatCard label="Total Races" value={stats?.total ?? "\u2014"} />
            <StatCard label="Scheduled" value={stats?.scheduled ?? "\u2014"} />
            <StatCard label="Active" value={stats?.active ?? "\u2014"} />
            <StatCard label="Cancelled" value={stats?.cancelled ?? "\u2014"} />
          </>}
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full flex-1 sm:min-w-48"><Input label="Search" value={q} onChange={(e) => {
    setQ(e.target.value);
    setPage(0);
  }} placeholder="Race name or code…" /></div>
        <div className="w-full sm:w-52"><Select label="Tournament" value={tournamentId} onChange={(e) => {
    setTournamentId(e.target.value);
    setPage(0);
  }} options={tournamentOptions} /></div>
        <div className="w-full sm:w-44"><Select label="Status" value={status} onChange={(e) => {
    setStatus(e.target.value);
    setPage(0);
  }} options={RACE_STATUS_FILTERS} /></div>
      </div>

      <Card>
        <CardBody className="p-0">
          {listQuery.isPending ? <div className="flex flex-col gap-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div> : listQuery.isError ? <EmptyState title="Couldn't load races" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No races" description="No races match the current filters." /> : <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Race</th>
                    <th className="px-4 py-3 font-medium">Tournament</th>
                    <th className="px-4 py-3 font-medium">Date / Time</th>
                    <th className="px-4 py-3 font-medium">Participants</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => <tr key={r.raceId} className="cursor-pointer hover:bg-subtle/40" onClick={() => setOpenRace(r)}>
                      <td className="px-4 py-3"><p className="font-medium text-ink">{r.name ?? r.raceCode}</p><p className="text-xs text-muted">{r.raceCode}</p></td>
                      <td className="px-4 py-3 text-muted">{r.tournamentName ?? "\u2014"}</td>
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

      {totalPages > 1 && <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted">Page {page + 1} / {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>}

      {creating && <RaceFormModal mode="create" tournaments={tournaments} onClose={() => setCreating(false)} />}
      {openRace && <RaceDetailModal raceId={openRace.raceId} fallback={openRace} tournaments={tournaments} onClose={() => setOpenRace(null)} />}
    </>;
}
export {
  RaceManagementPage as default
};
