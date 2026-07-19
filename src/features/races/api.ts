import { apiClient } from '@/common/lib/apiClient';
import { STATIC_RACE } from './mocks';
import type {
  EntryRow,
  MyEntryResponse,
  RaceDetailsVM,
  RaceEntryResponse,
  RaceResponse,
  RaceResultSheet,
  ReportViolation,
  YourHorse,
} from './types';

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** Humanize a BE enum: "GROUP_1_FLAT" → "Group 1 Flat". */
function humanizeEnum(value: string | null): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Format a weight in lbs, or an em-dash when absent. */
function formatWeight(lbs: number | null): string {
  return lbs != null ? `${lbs} lbs` : '—';
}

async function fetchRaces(): Promise<RaceResponse[]> {
  const { data } = await apiClient.get<{ data: RaceResponse[] | { content?: RaceResponse[] } }>('/races');
  return toArray(data.data);
}

/** A row in the Race Calendar — all real fields from GET /races. */
export interface RaceCalendarRow {
  raceId: string;
  raceCode: string;
  name: string;
  tournamentName: string | null;
  venue: string | null;
  scheduledStartAt: string | null;
  distanceMeter: number | null;
  raceType: string | null;
  status: string;
  entriesCount: number | null;
  maxParticipants: number | null;
  totalPurse: number | null;
}
interface RaceCalendarLite {
  raceId: string; raceCode: string; name: string | null;
  tournamentName: string | null; venue: string | null; venueName: string | null;
  scheduledStartAt: string | null; distanceMeter: number | null; raceType: string | null; status: string;
  entriesCount: number | null; maxParticipants: number | null; totalPurse: number | null;
}
export async function fetchRaceCalendar(): Promise<RaceCalendarRow[]> {
  const { data } = await apiClient.get<{ data: RaceCalendarLite[] | { content?: RaceCalendarLite[] } }>('/races', {
    params: { size: 200, sortBy: 'scheduledStartAt', sortDir: 'asc' },
  });
  return toArray(data.data).map((r) => ({
    raceId: r.raceId,
    raceCode: r.raceCode,
    name: r.name ?? r.raceCode,
    tournamentName: r.tournamentName,
    venue: r.venueName ?? r.venue,
    scheduledStartAt: r.scheduledStartAt,
    distanceMeter: r.distanceMeter,
    raceType: r.raceType,
    status: r.status,
    entriesCount: r.entriesCount,
    maxParticipants: r.maxParticipants,
    totalPurse: r.totalPurse,
  }));
}

/**
 * IDs of every race the current owner's horses are entered into (any status).
 * Prefers the dedicated GET /owner/races; if that endpoint isn't deployed yet,
 * falls back to the owner overview's upcoming races so the calendar still filters.
 */
export async function fetchOwnerRaceIds(): Promise<string[]> {
  try {
    const { data } = await apiClient.get<{ data: string[] | null }>('/owner/races');
    if (Array.isArray(data.data)) return data.data;
  } catch {
    // endpoint not available yet — fall through to the overview-based fallback
  }
  const { data } = await apiClient.get<{ data: { upcomingRaces?: { raceId: string }[] } | null }>('/owner/overview');
  return (data.data?.upcomingRaces ?? []).map((r) => r.raceId).filter(Boolean);
}

// ── Owner per-race report (registered vs. participated) ──
export interface OwnerRaceReportRow {
  raceId: string | null;
  raceCode: string | null;
  raceName: string | null;
  raceStatus: string | null;
  scheduledStartAt: string | null;
  tournamentName: string | null;
  horseId: string | null;
  horseName: string | null;
  registrationId: string;
  registrationCode: string | null;
  registrationStatus: string | null;
  rejectionReason: string | null;
  entered: boolean;
  participated: boolean;
  entryStatus: string | null;
  entryNo: number | null;
  finishPosition: number | null;
  finishTimeMs: number | null;
}
export async function fetchOwnerRaceReport(): Promise<OwnerRaceReportRow[]> {
  const { data } = await apiClient.get<{ data: OwnerRaceReportRow[] | { content?: OwnerRaceReportRow[] } }>(
    '/owner/race-report',
  );
  const d = data.data;
  return Array.isArray(d) ? d : (d?.content ?? []);
}

// ── Race Report: results sheet + violations ──
export async function fetchRaceResultSheet(raceId: string): Promise<RaceResultSheet | null> {
  const { data } = await apiClient.get<{ data: RaceResultSheet | null }>(`/races/${raceId}/results`);
  return data.data ?? null;
}
export async function fetchRaceReportViolations(raceId: string): Promise<ReportViolation[]> {
  const { data } = await apiClient.get<{ data: ReportViolation[] | { content?: ReportViolation[] } }>(
    `/races/${raceId}/violations`,
  );
  return Array.isArray(data.data) ? data.data : (data.data?.content ?? []);
}

/** Admin-only: certify the race's results as OFFICIAL (publish). */
export async function certifyRaceResults(raceId: string, stewardsReport?: string): Promise<void> {
  await apiClient.patch(`/races/${raceId}/results/certify`, {
    acknowledgeInquiriesResolved: true,
    stewardsReport: stewardsReport?.trim() || undefined,
  });
}

/** Race IDs the signed-in referee is assigned (by admin) to officiate — scopes referee reports. */
export async function fetchRefereeRaceIds(): Promise<string[]> {
  const { data } = await apiClient.get<{ data: string[] | null }>('/staffing/my-races');
  return data.data ?? [];
}

async function fetchEntries(raceId: string): Promise<RaceEntryResponse[]> {
  const { data } = await apiClient.get<{ data: RaceEntryResponse[] | { content?: RaceEntryResponse[] } }>(
    `/races/${raceId}/entries`,
  );
  return toArray(data.data);
}

/** The current owner's entry in this race, or null when they have none / on error. */
async function fetchMyEntry(raceId: string): Promise<MyEntryResponse | null> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: MyEntryResponse | null }>(
      `/races/${raceId}/my-entry`,
    );
    if (data.success === false || !data.data) return null;
    return data.data;
  } catch {
    return null;
  }
}

/** Map a BE entry to a runner row. */
function mapEntry(e: RaceEntryResponse): EntryRow {
  return {
    entryNo: e.entryNo,
    horseName: e.horseName.toUpperCase(),
    trainer: e.ownerName,
    jockey: e.jockeyName || '—',
    weight: formatWeight(e.weightCarriedLbs),
    last5: e.recentForm || '—',
    odds: e.odds || '—',
    yours: false,
  };
}

/**
 * Real fetch: GET /races (use the first race) + GET /races/{id}/entries +
 * GET /races/{id}/my-entry → the page view model. The owner's own runner row is
 * highlighted, and the "Your Horse Status" card reflects their real entry (null
 * when they have no horse in this race). Static-only fields come from STATIC_RACE.
 */
export async function fetchRaceDetails(): Promise<RaceDetailsVM | null> {
  const races = await fetchRaces();
  const race = races[0];
  if (!race) return null;

  const [rawEntries, myEntry] = await Promise.all([fetchEntries(race.raceId), fetchMyEntry(race.raceId)]);

  const entries = rawEntries.map(mapEntry);
  if (myEntry) {
    const mine = entries.find((row) => row.horseName === myEntry.horseName.toUpperCase());
    if (mine) mine.yours = true;
  }

  const yourHorse: YourHorse | null = myEntry
    ? {
        name: myEntry.horseName,
        drawStall: myEntry.drawStall || '—',
        jockey: myEntry.jockeyName || '—',
        weight: formatWeight(myEntry.weightCarriedLbs),
        status: myEntry.entryStatus,
      }
    : null;

  const distanceMeter = race.distanceMeter ?? 0;
  const raceTypeLabel = humanizeEnum(race.raceType);

  return {
    // From BE
    raceName: race.name,
    tournamentName: race.tournamentName ?? STATIC_RACE.venue,
    venue: STATIC_RACE.venue,
    scheduledStartAt: race.scheduledStartAt,
    distanceMeter,
    raceTypeLabel,
    entries,
    yourHorse,
    // STATIC — BE does not expose these.
    going: STATIC_RACE.going,
    distance: { label: STATIC_RACE.distanceLabel, meters: `${distanceMeter} Meters` },
    raceTypeTile: { label: raceTypeLabel, sub: STATIC_RACE.raceTypeSub },
    historicalWins: STATIC_RACE.historicalWins,
    prizeTiers: STATIC_RACE.prizeTiers,
    totalPurse: STATIC_RACE.totalPurse,
  };
}
