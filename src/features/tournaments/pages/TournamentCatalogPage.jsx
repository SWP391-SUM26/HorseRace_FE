import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Skeleton,
  Tabs,
} from "@/common/ui";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import { RegisterModal } from "@/features/registrations/components/RegisterModal";
import { OwnerRegistrationsPanel } from "@/features/registrations/components/OwnerRegistrationsPanel";
import {
  useTournament,
  useTournamentEntries,
  useTournamentRaces,
  useTournaments,
} from "../hooks";
import heroHorses from "@/assets/hero-horses.png";
import silverStreak from "@/assets/silver-streak.png";
import authHorse from "@/assets/auth-horse.jpg";
import jockeyImg from "@/assets/jockey.png";

const IMAGES = [heroHorses, silverStreak, authHorse, jockeyImg];
const imageFor = (i) => IMAGES[i % IMAGES.length];

const TABS = [
  { key: "catalog", label: "Catalog" },
  { key: "registrations", label: "My Registrations" },
];

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

const RACE_STATUS_TONE = {
  SCHEDULED: "info",
  OPEN: "warning",
  CLOSED: "neutral",
  RUNNING: "success",
  FINISHED: "neutral",
  OFFICIAL: "success",
  CANCELLED: "danger",
};

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const purse = (n) =>
  n != null ? `${Math.round(n).toLocaleString("vi-VN")}₫` : "—";

export default function TournamentCatalogPage() {
  const PAGE_SIZE = 4;
  const listQuery = useTournaments();
  // Owners only see tournaments they can still engage with: published (upcoming) or
  // open for registration. Draft, registration-closed, ongoing, completed and
  // cancelled events are hidden — so a finished tournament disappears from the catalog.
  const tournaments = useMemo(
    () =>
      (listQuery.data ?? []).filter(
        (t) => t.status === "PUBLISHED" || t.status === "REGISTRATION_OPEN",
      ),
    [listQuery.data],
  );
  const [selectedId, setSelectedId] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState("catalog");

  const selected = useMemo(() => {
    if (tournaments.length === 0) return null;
    return (
      tournaments.find((t) => t.tournamentId === selectedId) ??
      tournaments.find((t) => t.status === "REGISTRATION_OPEN") ??
      tournaments[0]
    );
  }, [tournaments, selectedId]);

  const filtered = useMemo(
    () =>
      tournaments.filter((t) =>
        t.name.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [tournaments, q],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages - 1);
  const paged = filtered.slice(
    pageClamped * PAGE_SIZE,
    pageClamped * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "registrations" ? (
        <OwnerRegistrationsPanel />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Catalog (left) ── */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold text-ink">
              Tournament Catalog
            </h1>
            <p className="mt-1 text-sm text-muted">
              Discover elite racing events worldwide.
            </p>

            <div className="mt-4">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
                placeholder="Search tournaments…"
              />
            </div>

            {listQuery.isPending ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))}
              </div>
            ) : listQuery.isError ? (
              <Card className="mt-4">
                <CardBody>
                  <EmptyState
                    title="Couldn't load tournaments"
                    description="Please reload the page."
                  />
                </CardBody>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="mt-4">
                <CardBody>
                  <EmptyState
                    title="No tournaments"
                    description={
                      q
                        ? "No events match your search."
                        : "No racing events to show yet."
                    }
                  />
                </CardBody>
              </Card>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {paged.map((t, i) => (
                    <CatalogCard
                      key={t.tournamentId}
                      t={t}
                      index={pageClamped * PAGE_SIZE + i}
                      active={selected?.tournamentId === t.tournamentId}
                      onSelect={() => setSelectedId(t.tournamentId)}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={pageClamped === i ? "primary" : "ghost"}
                        onClick={() => setPage(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Detail (right) ── */}
          <div className="lg:col-span-3">
            {selected ? (
              <DetailPanel tournament={selected} />
            ) : (
              <Card>
                <CardBody>
                  <EmptyState
                    title="Select a tournament"
                    description="Pick an event to see its details."
                  />
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CatalogCard({ t, index, active, onSelect }) {
  const s = statusDisplay(t.status);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-2xl border bg-surface text-left transition-colors",
        active
          ? "border-brand-700 ring-1 ring-brand-700"
          : "border-border hover:border-brand-700/50",
      )}
    >
      <div className="relative h-28 w-full">
        <img
          src={t.imageUrl || imageFor(index)}
          alt=""
          className="h-28 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute right-2 top-2">
          <Badge tone={s.tone}>{s.label}</Badge>
        </span>
      </div>
      <div className="p-3">
        <h3 className="truncate font-semibold text-ink">{t.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <CalendarDays size={12} />
          {t.startDate ? formatDate(t.startDate) : "—"}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">
              Prize Pool
            </p>
            <p className="text-sm font-semibold text-ink">
              {purse(t.totalPurse)}
            </p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </button>
  );
}

function DetailPanel({ tournament }) {
  const detailQuery = useTournament(tournament.tournamentId);
  const racesQuery = useTournamentRaces(tournament.tournamentId);
  const entriesQuery = useTournamentEntries(tournament.tournamentId);
  const [registerOpen, setRegisterOpen] = useState(false);

  const t = detailQuery.data ?? tournament;
  const races = racesQuery.data ?? [];
  const entries = entriesQuery.data ?? [];
  const s = statusDisplay(t.status);
  const isLive = t.status === "ONGOING";
  const maxEntries = Math.max(1, ...races.map((r) => r.entriesCount ?? 0));

  return (
    <Card className="overflow-hidden">
      {/* Hero */}
      <div className="relative h-48 w-full">
        <img
          src={t.imageUrl || heroHorses}
          alt=""
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute right-4 top-4">
          {t.status === "REGISTRATION_OPEN" || t.status === "PUBLISHED" ? (
            <Button size="sm" onClick={() => setRegisterOpen(true)}>
              Register
            </Button>
          ) : (
            <Badge tone={s.tone}>{s.label}</Badge>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-center gap-2">
            {isLive && <Badge tone="danger">LIVE BROADCAST</Badge>}
            <span className="text-xs font-medium text-white/80">
              {races.length} race{races.length === 1 ? "" : "s"}
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white">{t.name}</h2>
          {t.description && (
            <p className="mt-1 max-w-xl text-sm text-white/70 line-clamp-2">
              {t.description}
            </p>
          )}
        </div>
      </div>

      <CardBody className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Race schedule */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Race Schedule
            </p>
            {racesQuery.isPending ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : races.length === 0 ? (
              <p className="text-sm text-muted">No races scheduled.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {races.slice(0, 6).map((r) => {
                  const running = r.status === "RUNNING" || r.status === "OPEN";
                  return (
                    <li key={r.raceId} className="flex gap-3">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          running ? "bg-brand-700" : "bg-border",
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {fmtTime(r.scheduledStartAt)}
                        </p>
                        <p className="truncate text-sm text-ink">{r.name}</p>
                        <Badge tone={RACE_STATUS_TONE[r.status] ?? "neutral"}>
                          {r.status}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Elite entries */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Elite Entries
              </p>
              <span className="text-xs text-muted">{entries.length} Total</span>
            </div>
            {entriesQuery.isPending ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted">No entrants yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {entries.slice(0, 4).map((e) => (
                  <li
                    key={e.registrationId}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {e.horseName ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        Owner: {e.ownerName ?? "—"}
                      </p>
                    </div>
                    <Avatar name={e.ownerName ?? "—"} size={26} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Entry performance (entries per race — real) */}
        {races.length > 0 && (
          <div className="rounded-xl bg-subtle/40 p-4">
            <p className="mb-3 text-sm font-semibold text-ink">
              Entries per Race
            </p>
            <div className="flex h-28 items-end gap-2">
              {races.slice(0, 10).map((r) => (
                <div
                  key={r.raceId}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${r.name}: ${r.entriesCount ?? 0}`}
                >
                  <div
                    className="w-full rounded-t bg-brand-700/70"
                    style={{
                      height: `${Math.max(6, ((r.entriesCount ?? 0) / maxEntries) * 100)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>{races[0]?.raceCode}</span>
              <span>{races[Math.min(races.length, 10) - 1]?.raceCode}</span>
            </div>
          </div>
        )}
      </CardBody>

      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        presetTournamentId={t.tournamentId}
        presetTournamentName={t.name}
      />
    </Card>
  );
}
