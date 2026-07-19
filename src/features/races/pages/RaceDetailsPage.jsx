import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Badge, Card, CardBody, EmptyState, Skeleton } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useRaceCalendar } from "../hooks";
const STATUS_TONE = {
  SCHEDULED: "info",
  OPEN: "warning",
  CLOSED: "neutral",
  RUNNING: "success",
  FINISHED: "neutral",
  OFFICIAL: "success",
  CANCELLED: "danger"
};
const STATUS_LABEL = {
  SCHEDULED: "Scheduled",
  OPEN: "Open",
  CLOSED: "Closed",
  RUNNING: "Running",
  FINISHED: "Finished",
  OFFICIAL: "Official",
  CANCELLED: "Cancelled"
};
function RaceDetailsPage() {
  const { data, isPending, isError } = useRaceCalendar();
  const rows = data ?? [];
  return <>
      <PageHeader title="Race Calendar" subtitle="Lịch các cuộc đua trên toàn hệ thống, sắp xếp theo thời gian." />

      <Card>
        <CardBody className="p-0">
          {isPending ? <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div> : isError ? <EmptyState title="Không tải được lịch đua" description="Vui lòng thử lại sau." /> : rows.length === 0 ? <EmptyState title="Chưa có cuộc đua nào" description="Lịch đua sẽ hiển thị ở đây khi có race." /> : <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">Race</th>
                    <th className="px-4 py-3 font-medium">Tournament</th>
                    <th className="px-4 py-3 font-medium">Venue</th>
                    <th className="px-4 py-3 font-medium">Date &amp; Time</th>
                    <th className="px-4 py-3 font-medium">Distance</th>
                    <th className="px-4 py-3 font-medium">Entries</th>
                    <th className="px-4 py-3 font-medium">Purse</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => <tr key={r.raceId} className="hover:bg-subtle/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                            <CalendarDays size={15} />
                          </div>
                          <div>
                            <p className="font-medium text-ink">{r.name}</p>
                            <p className="text-xs text-muted">{r.raceCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.tournamentName ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{r.venue ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {r.scheduledStartAt ? formatDate(r.scheduledStartAt) : "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-muted">{r.distanceMeter != null ? `${r.distanceMeter} m` : "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{r.entriesCount ?? 0} / {r.maxParticipants ?? "\u2014"}</td>
                      <td className="px-4 py-3 text-muted">{r.totalPurse != null ? `$${r.totalPurse.toLocaleString()}` : "\u2014"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </CardBody>
      </Card>
    </>;
}
export {
  RaceDetailsPage as default
};
