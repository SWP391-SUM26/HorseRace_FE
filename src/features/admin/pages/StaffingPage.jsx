import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarDays, CheckCircle2, UserPlus, UserX } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Avatar, Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton, StatCard } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useAssignments, useStaffingDashboard } from "../hooks";
import { AssignPanelModal } from "../components/AssignPanelModal";
const ASSIGNMENT_STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNASSIGNED", label: "Unassigned" }
];
const RACE_STATUS_FILTER_OPTS = [
  { value: "", label: "All Races" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "OPEN", label: "Open" },
  { value: "RUNNING", label: "Running" },
  { value: "FINISHED", label: "Finished" },
  { value: "CANCELLED", label: "Cancelled" }
];
const PAGE_SIZE = 10;
function StaffingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [raceStatus, setRaceStatus] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [page, setPage] = useState(0);
  const [assigningRaceId, setAssigningRaceId] = useState(null);
  const dash = useStaffingDashboard();
  const listQuery = useAssignments({
    search: search || void 0,
    raceStatus: raceStatus || void 0,
    assignmentStatus: assignmentStatus || void 0,
    page,
    size: PAGE_SIZE
  });
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const total = listQuery.data?.total ?? 0;
  const d = dash.data;
  const pageFrom = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const pageTo = Math.min((page + 1) * PAGE_SIZE, total);
  function clearFilters() {
    setSearch("");
    setRaceStatus("");
    setAssignmentStatus("");
    setPage(0);
  }
  function open(raceId) {
    navigate(`/app/admin/staffing/${raceId}`);
  }
  return <>
      <PageHeader
    title="Staffing Management"
    subtitle="Assign referee panels to races and review staffing coverage."
  />

      {
    /* KPI cards */
  }
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dash.isPending || !d ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />) : <>
            <StatCard label="Total Scheduled Races" value={d.totalScheduledRaces} icon={<CalendarDays size={18} />} />
            <StatCard label="Races With Panel" value={d.assignedReferees} icon={<CheckCircle2 size={18} />} />
            <StatCard
    label="Unassigned Races"
    value={d.unassignedRaces}
    icon={<AlertTriangle size={18} />}
    hint={d.unassignedRaces > 0 ? <span className="flex items-center gap-1 text-danger"><AlertTriangle size={11} /> Action required</span> : <span className="text-muted">All races staffed</span>}
  />
            <StatCard label="Available Referees" value={d.availableReferees} icon={<UserPlus size={18} />} hint={<span className="text-muted">Available for assignment</span>} />
          </>}
      </div>

      {
    /* Filter bar */
  }
      <div className="mt-4 mb-4">
        <p className="mb-2 text-sm font-medium text-ink">Search</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full flex-1 sm:min-w-56">
            <Input value={search} onChange={(e) => {
    setSearch(e.target.value);
    setPage(0);
  }} placeholder="Search by race name, referee name, or race ID" />
          </div>
          <div className="w-full sm:w-44">
            <Select value={raceStatus} onChange={(e) => {
    setRaceStatus(e.target.value);
    setPage(0);
  }} options={RACE_STATUS_FILTER_OPTS} />
          </div>
          <div className="w-full sm:w-44">
            <Select value={assignmentStatus} onChange={(e) => {
    setAssignmentStatus(e.target.value);
    setPage(0);
  }} options={ASSIGNMENT_STATUS_FILTERS} />
          </div>
          <Button variant="secondary" className="shrink-0" onClick={clearFilters}>Clear Filters</Button>
        </div>
      </div>

      {
    /* Table */
  }
      <Card>
        <CardBody className="p-0">
          {listQuery.isPending ? <div className="flex flex-col gap-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div> : listQuery.isError ? <EmptyState title="Couldn't load assignments" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No races" description="No races match the current filters." /> : <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Race Details</th>
                    <th className="px-4 py-3 font-medium">Race Date</th>
                    <th className="px-4 py-3 font-medium">Panel</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((a) => {
    const count = a.assignmentCount ?? (a.assignmentStatus === "ASSIGNED" ? 1 : 0);
    return <tr key={a.raceId} className="cursor-pointer hover:bg-subtle/40" onClick={() => open(a.raceId)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><CalendarDays size={16} /></div>
                            <div>
                              <p className="font-medium text-ink">{a.raceName ?? a.raceCode ?? "\u2014"}</p>
                              <p className="text-xs text-muted">ID: {a.raceCode ?? a.raceId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{a.scheduledStartAt ? formatDate(a.scheduledStartAt) : "\u2014"}</td>
                        <td className="px-4 py-3">
                          {count > 0 ? <div className="flex items-center gap-2">
                              <Avatar name={a.refereeName ?? "\u2014"} src={a.refereeAvatarUrl ?? void 0} size={26} />
                              <span className="text-ink">{a.refereeName ?? "\u2014"}</span>
                              {count > 1 && <span className="text-xs text-muted">+{count - 1} more</span>}
                            </div> : <div className="flex items-center gap-2 text-muted"><UserX size={16} /><span>No panel</span></div>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={count > 0 ? "success" : "danger"}>{count > 0 ? `${count} assigned` : "Unassigned"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={(e) => {
      e.stopPropagation();
      setAssigningRaceId(a.raceId);
    }}><UserPlus size={14} /> Assign</Button>
                            <Button size="sm" variant="secondary" onClick={(e) => {
      e.stopPropagation();
      open(a.raceId);
    }}>Manage panel</Button>
                          </div>
                        </td>
                      </tr>;
  })}
                </tbody>
              </table>
            </div>}
        </CardBody>
      </Card>

      {
    /* Pagination */
  }
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{total > 0 ? `Showing ${pageFrom} to ${pageTo} of ${total} races` : ""}</p>
        {totalPages > 1 && <div className="flex flex-wrap items-center gap-1">
            <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => <Button key={i} size="sm" variant={page === i ? "primary" : "ghost"} onClick={() => setPage(i)}>{i + 1}</Button>)}
            {totalPages > 5 && <span className="px-1 text-sm text-muted">…</span>}
            {totalPages > 5 && <Button size="sm" variant={page === totalPages - 1 ? "primary" : "ghost"} onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>}
            <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>}
      </div>

      {assigningRaceId && <AssignPanelModal raceId={assigningRaceId} onClose={() => setAssigningRaceId(null)} />}
    </>;
}
export {
  StaffingPage as default
};
