import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, X, SlidersHorizontal, Trophy, CheckCircle2,
} from 'lucide-react';
import { Badge, Button, Card, CardBody, EmptyState, Select, Skeleton } from '@/common/ui';
import { cn } from '@/common/lib/cn';
import { useRaceCalendar } from '../hooks';
import type { RaceCalendarRow } from '../api';
import heroHorses from '@/assets/hero-horses.png';
import silverStreak from '@/assets/silver-streak.png';
import authHorse from '@/assets/auth-horse.jpg';
import jockeyImg from '@/assets/jockey.png';

const IMAGES = [heroHorses, silverStreak, authHorse, jockeyImg];
const imageFor = (i: number) => IMAGES[i % IMAGES.length];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

function statusDisplay(s: string): { label: string; tone: Tone } {
  switch (s) {
    case 'RUNNING': return { label: 'LIVE', tone: 'danger' };
    case 'OPEN': return { label: 'OPEN', tone: 'success' };
    case 'SCHEDULED': return { label: 'UPCOMING', tone: 'info' };
    case 'CLOSED': return { label: 'CLOSED', tone: 'warning' };
    case 'FINISHED':
    case 'OFFICIAL': return { label: 'FINISHED', tone: 'neutral' };
    case 'CANCELLED': return { label: 'CANCELLED', tone: 'danger' };
    default: return { label: s.replace(/_/g, ' '), tone: 'neutral' };
  }
}
const isFinished = (s: string) => s === 'FINISHED' || s === 'OFFICIAL' || s === 'CANCELLED';

/** Derive a race grade (G1/G2/G3) from a raceType enum like "GROUP_1_FLAT". */
function gradeFor(raceType: string | null): { short: string; long: string } | null {
  if (!raceType) return null;
  const m = raceType.match(/GROUP[_\s-]?([123])/i) || raceType.match(/\bG([123])\b/i);
  if (!m) return null;
  return { short: `G${m[1]}`, long: `Group ${m[1]}` };
}

function parseDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameYmd = (a: Date, b: Date) => ymd(a) === ymd(b);
const purse = (n: number | null) => (n != null ? `$${n.toLocaleString()}` : '—');
function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtCompactMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export interface RaceCalendarViewProps {
  /** Admin = true unlocks the "Add New Event" button and click-to-manage. */
  canManage?: boolean;
  onAddEvent?: () => void;
  onSelectRace?: (raceId: string) => void;
  /**
   * Owner mode: restrict the calendar to these race IDs (the owner's registered races).
   * `undefined` = show all races (admin). `null` = restricted, but the owner's data is still loading.
   */
  restrictToRaceIds?: string[] | null;
  subtitle?: string;
  /** Empty-state message shown when the restricted set has no races. */
  emptyLabel?: string;
  /** Owner mode: when set, each upcoming race card links to its Confirm-Participation readiness view. */
  confirmHref?: (raceId: string) => string;
}

export function RaceCalendarView({
  canManage = false, onAddEvent, onSelectRace, restrictToRaceIds, subtitle, emptyLabel, confirmHref,
}: RaceCalendarViewProps) {
  const { data, isPending, isError } = useRaceCalendar();
  const rows = useMemo(() => data ?? [], [data]);

  const allowedSet = useMemo(
    () => (Array.isArray(restrictToRaceIds) ? new Set(restrictToRaceIds) : null),
    [restrictToRaceIds],
  );
  const restrictPending = restrictToRaceIds === null;
  const isRestricted = restrictToRaceIds !== undefined;
  // Rows in scope for this view (owner = only their races; admin = all).
  const scopedRows = useMemo(
    () => (allowedSet ? rows.filter((r) => allowedSet.has(r.raceId)) : rows),
    [rows, allowedSet],
  );

  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<{ y: number; m: number }>({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<Date | null>(null);
  const [venue, setVenue] = useState('');
  const [grade, setGrade] = useState('');
  const didInit = useRef(false);

  // Index races by day (filtered).
  const filtered = useMemo(
    () => scopedRows.filter((r) => {
      if (venue && (r.venue ?? '') !== venue) return false;
      if (grade && gradeFor(r.raceType)?.short !== grade) return false;
      return true;
    }),
    [scopedRows, venue, grade],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, RaceCalendarRow[]>();
    for (const r of filtered) {
      const d = parseDate(r.scheduledStartAt);
      if (!d) continue;
      const key = ymd(d);
      (map.get(key) ?? map.set(key, []).get(key)!).push(r);
    }
    return map;
  }, [filtered]);

  // On first load, jump to the month of the nearest upcoming race and select it.
  useEffect(() => {
    if (didInit.current || isPending || restrictPending) return;
    didInit.current = true;
    const dated = scopedRows.map((r) => parseDate(r.scheduledStartAt)).filter((d): d is Date => !!d).sort((a, b) => +a - +b);
    if (dated.length === 0) return;
    const upcoming = dated.find((d) => +d >= +new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const target = upcoming ?? dated[dated.length - 1];
    setView({ y: target.getFullYear(), m: target.getMonth() });
    setSelected(target);
  }, [scopedRows, isPending, restrictPending, today]);

  const venues = useMemo(
    () => [...new Set(scopedRows.map((r) => r.venue).filter((v): v is string => !!v))].sort(),
    [scopedRows],
  );
  const grades = useMemo(
    () => [...new Set(scopedRows.map((r) => gradeFor(r.raceType)?.short).filter((g): g is string => !!g))].sort(),
    [scopedRows],
  );

  // Build 6-week grid (Sun-start) for the current view month.
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = new Date(view.y, view.m, 1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [view]);

  const selectedRaces = selected ? (byDay.get(ymd(selected)) ?? []) : [];
  const selectedPurse = selectedRaces.reduce((sum, r) => sum + (r.totalPurse ?? 0), 0);

  function goToday() {
    setView({ y: today.getFullYear(), m: today.getMonth() });
    setSelected(today);
  }
  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const effectiveLoading = isPending || restrictPending;
  const noScoped = isRestricted && !effectiveLoading && scopedRows.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Race Calendar</h1>
        <p className="mt-1 text-sm text-muted">{subtitle ?? 'Manage and track global racing events.'}</p>
      </div>

      {noScoped ? (
        <Card><CardBody><EmptyState title={emptyLabel ?? 'No races yet'} description="Register a horse for a tournament race and it will appear on your calendar." /></CardBody></Card>
      ) : (
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Calendar (left) ── */}
        <div className="lg:col-span-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
              <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}
                className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-36 text-center text-sm font-semibold text-ink">{MONTHS[view.m]} {view.y}</span>
              <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)}
                className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="rounded-lg border border-border bg-subtle px-3 py-1.5 text-sm font-medium text-muted">Month</span>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-44">
              <Select label="Track Location" value={venue} onChange={(e) => setVenue(e.target.value)}
                options={[{ value: '', label: 'All Tracks' }, ...venues.map((v) => ({ value: v, label: v }))]} />
            </div>
            <div className="min-w-40">
              <Select label="Race Grade" value={grade} onChange={(e) => setGrade(e.target.value)}
                options={[{ value: '', label: 'All Grades' }, ...grades.map((g) => ({ value: g, label: g }))]} />
            </div>
            <Button variant="secondary" onClick={() => { setVenue(''); setGrade(''); }} title="Reset filters">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Grid */}
          {isError ? (
            <Card className="mt-4"><CardBody><EmptyState title="Couldn't load races" description="Please reload the page." /></CardBody></Card>
          ) : (
            <Card className="mt-4 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border bg-subtle/40">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((date, i) => {
                  const inMonth = date.getMonth() === view.m;
                  const races = byDay.get(ymd(date)) ?? [];
                  const isToday = sameYmd(date, today);
                  const isSelected = selected ? sameYmd(date, selected) : false;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelected(date)}
                      className={cn(
                        'flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5 text-left align-top transition-colors',
                        i % 7 === 6 && 'border-r-0',
                        !inMonth && 'bg-subtle/30',
                        isSelected ? 'bg-brand-50 ring-1 ring-inset ring-brand-700' : 'hover:bg-subtle/50',
                      )}
                    >
                      <span className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                        isToday ? 'bg-brand-700 text-white' : isSelected ? 'text-brand-700' : inMonth ? 'text-ink' : 'text-muted/60',
                      )}>
                        {date.getDate()}
                      </span>
                      <div className="flex flex-col gap-1">
                        {races.slice(0, 2).map((r) => {
                          const s = statusDisplay(r.status);
                          const g = gradeFor(r.raceType);
                          return (
                            <span key={r.raceId}
                              className={cn(
                                'flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] font-medium',
                                s.tone === 'danger' ? 'bg-red-50 text-danger'
                                  : s.tone === 'success' ? 'bg-brand-50 text-success'
                                  : s.tone === 'neutral' ? 'bg-subtle text-muted'
                                  : 'bg-amber-50 text-warning',
                              )}
                              title={r.name}
                            >
                              <span className="truncate">{r.venue ?? r.name}</span>
                              {g && <span className="ml-auto shrink-0 rounded bg-white/60 px-1 text-[9px] font-bold">{g.short}</span>}
                            </span>
                          );
                        })}
                        {races.length > 2 && (
                          <span className="px-1 text-[10px] font-medium text-muted">+{races.length - 2} more races</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── Detail panel (right) ── */}
        <div className="lg:col-span-1">
          <DetailPanel
            isPending={effectiveLoading}
            selected={selected}
            races={selectedRaces}
            totalPurse={selectedPurse}
            canManage={canManage}
            onClose={() => setSelected(null)}
            onAddEvent={onAddEvent}
            onSelectRace={onSelectRace}
            confirmHref={confirmHref}
          />
        </div>
      </div>
      )}
    </div>
  );
}

function DetailPanel({
  isPending, selected, races, totalPurse, canManage, onClose, onAddEvent, onSelectRace, confirmHref,
}: {
  isPending: boolean;
  selected: Date | null;
  races: RaceCalendarRow[];
  totalPurse: number;
  canManage: boolean;
  onClose: () => void;
  onAddEvent?: () => void;
  onSelectRace?: (raceId: string) => void;
  confirmHref?: (raceId: string) => string;
}) {
  return (
    <Card className="lg:sticky lg:top-4 flex max-h-[calc(100dvh-7rem)] flex-col">
      {!selected ? (
        <CardBody><EmptyState title="Select a date" description="Pick a day on the calendar to see its events." /></CardBody>
      ) : (
        <>
          <div className="flex items-start justify-between border-b border-border p-5 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                {MONTHS[selected.getMonth()]} {selected.getDate()}
              </h2>
              <p className="text-sm text-muted">{FULL_WEEKDAYS[selected.getDay()]}, {selected.getFullYear()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-1 text-xs font-medium text-ink">
                  <CalendarDays className="h-3.5 w-3.5" /> {races.length} EVENT{races.length === 1 ? '' : 'S'}
                </span>
                {totalPurse > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-warning">
                    <Trophy className="h-3.5 w-3.5" /> {fmtCompactMoney(totalPurse)} PURSE
                  </span>
                )}
              </div>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-subtle hover:text-ink">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {isPending ? (
              <div className="flex flex-col gap-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div>
            ) : races.length === 0 ? (
              <EmptyState title="No events" description="No races scheduled on this day." />
            ) : (
              <ul className="flex flex-col gap-4">
                {races.map((r, i) => (
                  <EventCard
                    key={r.raceId}
                    race={r}
                    index={i}
                    clickable={canManage}
                    onClick={() => canManage && onSelectRace?.(r.raceId)}
                    confirmHref={confirmHref}
                  />
                ))}
              </ul>
            )}
          </div>

          {canManage && (
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={onAddEvent}><Plus className="h-4 w-4" /> Add New Event</Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function EventCard({ race, index, clickable, onClick, confirmHref }: { race: RaceCalendarRow; index: number; clickable: boolean; onClick: () => void; confirmHref?: (raceId: string) => string }) {
  const s = statusDisplay(race.status);
  const g = gradeFor(race.raceType);
  const start = parseDate(race.scheduledStartAt);
  const finished = isFinished(race.status);
  const entries = race.entriesCount ?? 0;

  const Wrapper = clickable ? 'button' : 'div';

  // Finished/cancelled events render condensed (no hero image, no stats).
  if (finished) {
    return (
      <li>
        <Wrapper
          type={clickable ? 'button' : undefined}
          onClick={clickable ? onClick : undefined}
          className={cn('block w-full rounded-xl border border-border p-3 text-left', clickable && 'transition-colors hover:bg-subtle')}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-ink">{race.name}</span>
            <Badge tone={s.tone}>{s.label}</Badge>
          </div>
          {race.venue && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" />{race.venue}</p>
          )}
        </Wrapper>
      </li>
    );
  }

  return (
    <li>
      <Wrapper
        type={clickable ? 'button' : undefined}
        onClick={clickable ? onClick : undefined}
        className={cn('block w-full overflow-hidden rounded-2xl border border-border bg-surface text-left', clickable && 'transition-shadow hover:shadow-md')}
      >
        <div className="relative h-24 w-full">
          <img src={imageFor(index)} alt="" className="h-24 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-ink">{race.name}</h3>
            <Badge tone={s.tone}>{s.label}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5" />{race.venue ?? race.tournamentName ?? '—'}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border p-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Grade</p>
              <p className="text-sm font-semibold text-ink">{g?.long ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Est. Purse</p>
              <p className="text-sm font-semibold text-ink">{purse(race.totalPurse)}</p>
            </div>
          </div>

          {entries > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-muted">Featured Entries</p>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(3, entries) }, (_, k) => (
                  <span key={k} className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    k === 0 ? 'bg-brand-700 text-white' : 'bg-subtle text-ink',
                  )}>{k + 1}</span>
                ))}
                {entries > 3 && <span className="text-xs font-medium text-muted">+{entries - 3}</span>}
              </div>
            </div>
          )}

          {start && (
            <p className="mt-3 text-xs text-muted">Post time {fmtTime(start)}</p>
          )}

          {confirmHref && (
            <Link
              to={confirmHref(race.raceId)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-700 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm participation
            </Link>
          )}
        </div>
      </Wrapper>
    </li>
  );
}
