import { useState } from "react";
import { FileText } from "lucide-react";
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
import { useToast } from "@/common/providers/ToastProvider";
import { downloadCsv } from "@/common/lib/csv";
import { formatDate } from "@/common/lib/format";
import { useRegistrationStats, useRegistrations } from "../hooks";
import {
  REGISTRATION_STATUS_FILTERS,
  REGISTRATION_STATUS_TONE,
} from "../constants";
import { RegistrationDetailModal } from "../components/RegistrationDetailModal";

export default function RegistrationApprovalPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState(null);

  const statsQuery = useRegistrationStats();
  const listQuery = useRegistrations({
    q: q || undefined,
    status: status || undefined,
    page,
  });

  const stats = statsQuery.data;
  const rows = listQuery.data?.rows ?? [];
  const totalPages = listQuery.data?.totalPages ?? 1;

  function exportCsv() {
    if (rows.length === 0) return toast.error("Nothing to export");
    downloadCsv(
      "registrations.csv",
      [
        { label: "Code", value: (r) => r.registrationCode },
        { label: "Horse", value: (r) => r.horseName ?? "" },
        { label: "Owner", value: (r) => r.ownerName ?? "" },
        { label: "Tournament", value: (r) => r.tournamentName ?? "" },
        { label: "Status", value: (r) => r.status },
      ],
      rows,
    );
    toast.success(
      `Exported ${rows.length} registration${rows.length === 1 ? "" : "s"}`,
    );
  }

  return (
    <>
      <PageHeader
        title="Registration Approval"
        subtitle="Review and approve horses registered into races and tournaments."
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <FileText size={16} /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard label="Total" value={stats?.total ?? "—"} />
            <StatCard
              label="Pending"
              value={stats?.pending ?? "—"}
              hint="Awaiting review"
            />
            <StatCard label="Approved" value={stats?.approved ?? "—"} />
            <StatCard label="Rejected" value={stats?.rejected ?? "—"} />
          </>
        )}
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full flex-1 sm:min-w-56">
          <Input
            label="Search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Horse, owner, or code…"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={REGISTRATION_STATUS_FILTERS}
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
              title="Couldn't load registrations"
              description="Please reload the page."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No registrations"
              description="Nothing to review here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Horse / Owner</th>
                    <th className="px-4 py-3 font-medium">Tournament</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr
                      key={r.registrationId}
                      className="cursor-pointer hover:bg-subtle/40"
                      onClick={() => setViewing(r)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {r.horseName ?? "—"}
                        </p>
                        <p className="text-xs text-muted">
                          {r.ownerName ?? "—"} · {r.registrationCode}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {r.tournamentName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {r.submittedAt ? formatDate(r.submittedAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={REGISTRATION_STATUS_TONE[r.status]}>
                          {r.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewing(r);
                          }}
                        >
                          Review
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
        <div className="mt-4 flex items-center justify-end gap-2">
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

      {viewing && (
        <RegistrationDetailModal
          registration={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
