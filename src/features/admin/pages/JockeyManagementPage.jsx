import { useState } from "react";
import { PageHeader } from "@/common/components/PageHeader";
import { Avatar, Badge, Button, Card, CardBody, EmptyState, Input, Select, Skeleton, StatCard } from "@/common/ui";
import { humanize } from "../api";
import { useAdminJockeys } from "../hooks";
import { JockeyDetailModal } from "../components/JockeyDetailModal";
import { JOCKEY_SORT_OPTIONS, USER_STATUS_FILTERS, USER_STATUS_TONE } from "../constants";
function JockeyManagementPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("winCount");
  const [page, setPage] = useState(0);
  const [openJockey, setOpenJockey] = useState(null);
  const listQuery = useAdminJockeys({
    q: q || void 0,
    status: status || void 0,
    sortBy,
    page
  });
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const total = listQuery.data?.total ?? 0;
  const activeCount = rows.filter((j) => j.status === "ACTIVE").length;
  const totalWins = rows.reduce((sum, j) => sum + (j.winCount ?? 0), 0);
  return <>
      <PageHeader
    title="Jockey Management"
    subtitle="Search and review licensed jockeys — profile, licence, and career performance."
  />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {listQuery.isPending ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />) : <>
            <StatCard label="Total Jockeys" value={total} />
            <StatCard label="On This Page" value={rows.length} />
            <StatCard label="Active (page)" value={activeCount} />
            <StatCard label="Wins (page)" value={totalWins} />
          </>}
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full flex-1 sm:min-w-48">
          <Input
    label="Search"
    value={q}
    onChange={(e) => {
      setQ(e.target.value);
      setPage(0);
    }}
    placeholder="Jockey name…"
  />
        </div>
        <div className="w-full sm:w-44">
          <Select label="Status" value={status} onChange={(e) => {
    setStatus(e.target.value);
    setPage(0);
  }} options={USER_STATUS_FILTERS} />
        </div>
        <div className="w-full sm:w-44">
          <Select label="Sort by" value={sortBy} onChange={(e) => {
    setSortBy(e.target.value);
    setPage(0);
  }} options={JOCKEY_SORT_OPTIONS} />
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {listQuery.isPending ? <div className="flex flex-col gap-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div> : listQuery.isError ? <EmptyState title="Couldn't load jockeys" description="Please reload the page." /> : rows.length === 0 ? <EmptyState title="No jockeys" description="No jockeys match the current filters." /> : <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Jockey</th>
                    <th className="px-4 py-3 font-medium">Licence</th>
                    <th className="px-4 py-3 font-medium">Experience</th>
                    <th className="px-4 py-3 font-medium">Wins</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((j) => <tr key={j.userId} className="cursor-pointer hover:bg-subtle/40" onClick={() => setOpenJockey(j)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={j.fullName ?? "\u2014"} src={j.avatarUrl} size={32} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{j.fullName ?? "\u2014"}</p>
                            <p className="truncate text-xs text-muted">{j.userCode ?? j.email ?? "\u2014"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{j.licenseNo ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{j.experienceYrs != null ? `${j.experienceYrs} yr${j.experienceYrs === 1 ? "" : "s"}` : "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{j.winCount ?? 0}</td>
                      <td className="px-4 py-3">
                        {j.status ? <Badge tone={USER_STATUS_TONE[j.status] ?? "neutral"}>{humanize(j.status)}</Badge> : "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="secondary" onClick={(e) => {
    e.stopPropagation();
    setOpenJockey(j);
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

      {openJockey && <JockeyDetailModal fallback={openJockey} onClose={() => setOpenJockey(null)} />}
    </>;
}
export {
  JockeyManagementPage as default
};
