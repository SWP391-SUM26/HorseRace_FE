import { useState } from "react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
  StatCard,
} from "@/common/ui";
import { humanize } from "../api";
import { useAdminHorses } from "../hooks";
import { HorseDetailModal } from "../components/HorseDetailModal";
import {
  HORSE_GENDER_FILTERS,
  HORSE_HEALTH_TONE,
  HORSE_STATUS_FILTERS,
  HORSE_STATUS_TONE,
} from "../constants";

export default function HorseManagementPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(0);
  const [openHorse, setOpenHorse] = useState(null);

  const listQuery = useAdminHorses({
    q: q || undefined,
    status: status || undefined,
    gender: gender || undefined,
    page,
  });

  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;
  const total = listQuery.data?.total ?? 0;
  const activeCount = rows.filter((h) => h.status === "ACTIVE").length;
  const injuredCount = rows.filter(
    (h) => h.healthStatus && h.healthStatus !== "HEALTHY",
  ).length;

  return (
    <>
      <PageHeader
        title="Horse Management"
        subtitle="Search, review, and inspect every registered horse — owner, medical status, and eligibility."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {listQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Horses" value={total} />
            <StatCard label="On This Page" value={rows.length} />
            <StatCard label="Active (page)" value={activeCount} />
            <StatCard label="Needs Attention (page)" value={injuredCount} />
          </>
        )}
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
            placeholder="Horse name or code…"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={HORSE_STATUS_FILTERS}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(0);
            }}
            options={HORSE_GENDER_FILTERS}
          />
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {listQuery.isPending ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <EmptyState
              title="Couldn't load horses"
              description="Please reload the page."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No horses"
              description="No horses match the current filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Horse</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Gender / Breed</th>
                    <th className="px-4 py-3 font-medium">Health</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((h) => (
                    <tr
                      key={h.horseId}
                      className="cursor-pointer hover:bg-subtle/40"
                      onClick={() => setOpenHorse(h)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {h.name ?? h.horseCode}
                        </p>
                        <p className="text-xs text-muted">{h.horseCode}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {h.ownerName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {h.gender ? humanize(h.gender) : "—"}
                        <span className="text-xs text-muted">
                          {" "}
                          · {h.breed ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {h.healthStatus ? (
                          <Badge
                            tone={HORSE_HEALTH_TONE[h.healthStatus] ?? "neutral"}
                          >
                            {humanize(h.healthStatus)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {h.status ? (
                          <Badge tone={HORSE_STATUS_TONE[h.status] ?? "neutral"}>
                            {humanize(h.status)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenHorse(h);
                          }}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-muted">
            Page {page + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {openHorse && (
        <HorseDetailModal horse={openHorse} onClose={() => setOpenHorse(null)} />
      )}
    </>
  );
}
