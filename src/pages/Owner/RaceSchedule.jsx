import { useEffect, useState } from "react";
import { CalendarDays, Flag, MapPin } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Button, Card, CardBody, CardHeader, DataTable, EmptyState, Modal, Skeleton } from "@/common/ui";
import { getRaceEntries, getRaceList } from "@/services/race";

function formatDate(value) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusTone(status = "") {
  if (status === "OPEN") return "success";
  if (status === "RUNNING" || status === "LIVE") return "danger";
  if (status === "CANCELLED") return "neutral";
  return "info";
}

export default function RaceSchedule() {
  const [races, setRaces] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", page: 1, pageSize: 8 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRace, setSelectedRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadRaces() {
    setLoading(true);
    setError("");
    try {
      const result = await getRaceList({
        search: filters.search,
        status: filters.status,
        page: filters.page,
        pageSize: filters.pageSize,
        sortBy: "scheduledStartAt",
        sortOrder: "asc",
      });
      setRaces(result.items || []);
      setPagination({
        page: result.page || filters.page,
        totalPages: result.totalPages || 1,
        totalItems: result.totalItems || 0,
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to load race schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(loadRaces, 350);
    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: key === "page" ? value : 1 }));
  }

  async function openDetail(race) {
    setSelectedRace(race);
    setEntries([]);
    setDetailLoading(true);
    try {
      const result = await getRaceEntries(race.raceId || race.id);
      setEntries(Array.isArray(result) ? result : result?.content || result?.items || []);
    } catch {
      setEntries([]);
    } finally {
      setDetailLoading(false);
    }
  }

  const columns = [
    {
      key: "race",
      header: "Race",
      render: (race) => (
        <div>
          <p className="font-semibold text-ink">{race.name || race.raceCode}</p>
          <p className="text-xs text-muted">{race.raceCode}</p>
        </div>
      ),
    },
    { key: "tournament", header: "Tournament", render: (race) => race.tournamentName || "N/A" },
    { key: "time", header: "Date / Time", render: (race) => formatDate(race.scheduledStartAt) },
    {
      key: "raceInfo",
      header: "Race Info",
      render: (race) => (
        <div>
          <p className="font-semibold text-ink">{race.raceType || "Race"}</p>
          <p className="text-xs text-muted">{race.distanceMeter ? `${race.distanceMeter}m` : "Distance TBA"}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (race) => <Badge tone={statusTone(race.status)}>{race.status || "SCHEDULED"}</Badge> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (race) => (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="inline-flex min-w-[116px] items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-100"
          onClick={() => openDetail(race)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Race Schedule"
        subtitle="View upcoming races and inspect registered entries for your planning."
      />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">{error}</div>}

      <Card>
        <CardHeader>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search race..."
            />
            <select
              className="h-11 rounded-lg border border-border bg-surface px-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="RUNNING">Running</option>
              <option value="FINISHED">Finished</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Skeleton className="h-80 rounded-xl" />
          ) : races.length === 0 ? (
            <EmptyState title="No races found" description="There are no races matching the selected filters." />
          ) : (
            <DataTable rows={races} columns={columns} rowKey={(race) => race.raceId || race.id} flush />
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" disabled={pagination.page <= 1} onClick={() => updateFilter("page", pagination.page - 1)}>Previous</Button>
            <span className="text-sm text-muted">Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} races</span>
            <Button type="button" variant="secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => updateFilter("page", pagination.page + 1)}>Next</Button>
          </div>
        </CardBody>
      </Card>

      <Modal open={!!selectedRace} onClose={() => setSelectedRace(null)} title="Race Details">
        {selectedRace && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-brand-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-ink">{selectedRace.name || selectedRace.raceCode}</p>
                  <p className="text-sm text-muted">{selectedRace.tournamentName}</p>
                </div>
                <Badge tone={statusTone(selectedRace.status)}>{selectedRace.status || "SCHEDULED"}</Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2"><CalendarDays size={15} /> {formatDate(selectedRace.scheduledStartAt)}</p>
                <p className="flex items-center gap-2"><Flag size={15} /> {selectedRace.raceType || "Race"} · {selectedRace.distanceMeter || "TBA"}m</p>
                <p className="flex items-center gap-2"><MapPin size={15} /> Track: {selectedRace.trackCondition || "TBA"}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-ink">Registered Entries</h3>
              {detailLoading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : entries.length === 0 ? (
                <EmptyState title="No race entries returned by API" />
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div key={entry.entryId || entry.id || index} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                      <div>
                        <p className="font-semibold text-ink">{entry.horseName || "Unknown Horse"}</p>
                        <p className="text-muted">Jockey: {entry.jockeyName || "Not assigned"}</p>
                      </div>
                      <Badge tone="neutral">Gate {entry.laneNo || entry.entryNo || index + 1}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
