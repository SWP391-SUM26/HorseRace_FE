import { useMemo, useState } from "react";
import { ArrowRight, Clock, MapPin, Trophy } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Skeleton,
  Tabs,
} from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { cn } from "@/common/lib/cn";
import { humanize } from "../api";
import { useMyRides, useRaceEntries, useRideIntelligence } from "../hooks";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past Results" },
];

/** USD-shaped earnings; render with a $ prefix. */
/** "14:30" from an ISO datetime (UTC, matching formatDate's convention). */
function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/** "1st" / "2nd" / "3rd" / "4th" finish position. */
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

/** UTC midnight day key for grouping, e.g. "2026-06-23"; null → "unscheduled". */
function dayKey(iso) {
  if (!iso) return "unscheduled";
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Day header derived from a date: "TODAY, OCT 24" / "TOMORROW, OCT 25",
 * otherwise weekday "MON, OCT 27". All in UTC to match formatDate/formatTime.
 * A null date (race not scheduled yet) groups under "CHƯA LÊN LỊCH".
 */
function dayHeader(iso) {
  if (!iso) return "CHƯA LÊN LỊCH";
  const d = new Date(iso);
  const today = new Date();
  const utcMid = (x) =>
    Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate());
  const diffDays = Math.round((utcMid(d) - utcMid(today)) / 86_400_000);
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const stamp = `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  if (diffDays === 0) return `TODAY, ${stamp}`;
  if (diffDays === 1) return `TOMORROW, ${stamp}`;
  if (diffDays === -1) return `YESTERDAY, ${stamp}`;
  return `${weekdays[d.getUTCDay()]}, ${stamp}`;
}

/** Group dated items by calendar day, preserving the incoming order. */
function groupByDay(items, getDate) {
  const order = [];
  const buckets = new Map();
  for (const item of items) {
    const key = dayKey(getDate(item));
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key).push(item);
  }
  return order.map((key) => {
    const bucket = buckets.get(key);
    return { header: dayHeader(getDate(bucket[0])), items: bucket };
  });
}

// ----- Unified row view model so both tabs share the list + selection -----

export default function RaceSchedulePage() {
  const { user } = useAuth();
  const jockeyUserId = user?.id ?? "";
  const [tab, setTab] = useState("upcoming");
  const [selectedId, setSelectedId] = useState(null);

  // REAL — GET /assignments/me/rides split by time window.
  const upcomingQuery = useMyRides("UPCOMING", !!jockeyUserId);
  const pastQuery = useMyRides("PAST", !!jockeyUserId);
  const activeQuery = tab === "upcoming" ? upcomingQuery : pastQuery;

  const rows = useMemo(
    () =>
      (activeQuery.data ?? []).map((r, i) => rideToRow(r, i, tab === "past")),
    [activeQuery.data, tab],
  );
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;
  const groups = useMemo(() => groupByDay(rows, (r) => r.date), [rows]);

  function handleTab(next) {
    setTab(next);
    setSelectedId(null);
  }

  return (
    <>
      <PageHeader
        title="Race Schedule"
        subtitle="Manage your upcoming rides and review past performance."
        actions={
          <Tabs tabs={TABS} active={tab} onChange={(k) => handleTab(k)} />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — schedule list grouped by day */}
        <section className="flex flex-col gap-6 lg:col-span-2">
          {activeQuery.isPending ? (
            <ScheduleSkeleton />
          ) : activeQuery.isError ? (
            <EmptyState
              title="Không tải được lịch đua"
              description="Vui lòng tải lại trang để thử lại."
            />
          ) : groups.length === 0 ? (
            <EmptyState
              title={
                tab === "upcoming"
                  ? "Chưa có lịch đua sắp tới"
                  : "Chưa có kết quả đua"
              }
              description={
                tab === "upcoming"
                  ? "Các lời mời đã nhận (sắp diễn ra) sẽ hiển thị tại đây."
                  : "Lịch sử đua đã hoàn thành sẽ hiển thị tại đây."
              }
            />
          ) : (
            groups.map((group) => (
              <div key={group.header} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {group.header}
                </p>
                {group.items.map((row) => (
                  <RideRow
                    key={row.id}
                    row={row}
                    active={selected?.id === row.id}
                    onSelect={() => setSelectedId(row.id)}
                  />
                ))}
              </div>
            ))
          )}
        </section>

        {/* RIGHT — Ride Intelligence: REAL (resolve horseId via /races/{raceId}/entries,
             then GET /horses/{id}/ride-intelligence). */}
        <aside>
          <RideIntelligence row={selected} onReview={() => handleTab("past")} />
        </aside>
      </div>
    </>
  );
}

function rideToRow(ride, index, isPast) {
  return {
    id: ride.id,
    raceId: ride.raceId,
    date: ride.date,
    raceLabel: `RACE ${index + 1}`,
    raceName: ride.raceName,
    horse: ride.horse,
    venue: ride.venue,
    confirmed: isPast ? undefined : true,
    position: isPast ? (ride.finishPosition ?? undefined) : undefined,
    earnings: isPast ? (ride.earnings ?? undefined) : undefined,
  };
}

function RideRow({ row, active, onSelect }) {
  const isPast = row.position != null;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border bg-surface p-4 text-left shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-brand-500",
        active
          ? "border-brand-700 ring-1 ring-brand-700"
          : "border-border hover:border-brand-500",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Clock size={14} className="text-muted" />
              {formatTime(row.date)}
            </span>
            <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {row.raceLabel}
            </span>
            {isPast ? (
              <Badge tone={row.position === 1 ? "success" : "neutral"}>
                {ordinal(row.position)} place
              </Badge>
            ) : (
              <Badge tone={row.confirmed ? "success" : "warning"}>
                {row.confirmed ? "CONFIRMED" : "PENDING"}
              </Badge>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-medium text-ink">
            {row.raceName}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <MapPin size={12} />
            {row.venue}
          </p>
          <p className="mt-1 text-xs text-muted">
            Mount: <span className="font-medium text-ink">{row.horse}</span>
          </p>
        </div>

        {isPast && row.earnings != null && (
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Earnings
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {formatMoney(row.earnings)}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Ride Intelligence — REAL (GET /horses/{id}/ride-intelligence, BE contract #7).
 * The schedule ride carries only a horse NAME, so we resolve horseId from the
 * race entries (GET /races/{raceId}/entries) by matching the name, then fetch
 * the horse's form profile. `formNotes` is hidden when null (BE returns null today).
 */
function RideIntelligence({ row, onReview }) {
  const entriesQuery = useRaceEntries(row?.raceId ?? null);
  const horseId = useMemo(() => {
    if (!row || !entriesQuery.data) return null;
    // Resolve only on an UNAMBIGUOUS name match — if two entries share a display
    // name we cannot tell them apart (the ride carries no horseId/code), so bail
    // rather than silently show another horse's form.
    const matches = entriesQuery.data.filter((e) => e.horseName === row.horse);
    return matches.length === 1 ? matches[0].horseId : null;
  }, [row, entriesQuery.data]);
  const intelQuery = useRideIntelligence(horseId);

  const resolving =
    !!row && (entriesQuery.isPending || (!!horseId && intelQuery.isPending));
  // A transient fetch error (network/server) — distinct from "no data for this horse".
  const failed = !!row && (entriesQuery.isError || intelQuery.isError);
  // Entries loaded but no unique matching horse (name not found or ambiguous).
  const unavailable = !!row && entriesQuery.isSuccess && !horseId;
  const intel = intelQuery.data;

  return (
    <Card>
      <CardBody className="flex flex-col gap-5">
        <h2 className="font-semibold text-ink">Ride Intelligence</h2>

        {!row ? (
          <p className="text-sm text-muted">
            Chọn một chặng đua để xem thông tin.
          </p>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold text-ink">{row.horse}</p>
              {intel && (
                <p className="text-sm text-muted">
                  Form: {intel.recentForm ?? "—"}
                </p>
              )}
            </div>

            {resolving ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : failed ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">
                  Không tải được thông tin, vui lòng thử lại.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    entriesQuery.refetch();
                    intelQuery.refetch();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            ) : unavailable || !intel ? (
              <p className="text-sm text-muted">
                Không có dữ liệu phong độ cho ngựa này.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <IntelStat
                    label="Preferred Surface"
                    value={
                      intel.preferredSurface
                        ? humanize(intel.preferredSurface)
                        : "—"
                    }
                  />

                  <IntelStat
                    label="Post Time"
                    value={intel.postTime ? formatTime(intel.postTime) : "—"}
                  />

                  <IntelStat label="Trainer" value={intel.trainer ?? "—"} />
                  <IntelStat label="Owner" value={intel.owner ?? "—"} />
                </div>

                {intel.formNotes && (
                  <div className="rounded-xl border border-border bg-subtle/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Recent Form Notes
                    </p>
                    <p className="mt-1.5 text-sm text-ink">{intel.formNotes}</p>
                  </div>
                )}
              </>
            )}

            <Button variant="secondary" className="w-full" onClick={onReview}>
              <Trophy size={16} />
              Review Full Past Performances
              <ArrowRight size={16} />
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function IntelStat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32 rounded" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
