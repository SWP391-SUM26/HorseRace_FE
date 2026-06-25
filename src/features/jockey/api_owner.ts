import { apiClient } from '@/common/lib/apiClient';
import type {
  Invitation,
  InvitationResponse,
  JockeyCard,
  JockeyResponse,
  JockeySuggestion,
  RaceDetail,
  RaceEntryLite,
  RaceResponse,
  UnassignedEntryResponse,
  UnassignedHorse,
} from './types_owner';

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "FRONT_RUNNER" -> "Front Runner". */
function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Map a BE jockey to a marketplace card using real fields only. */
function mapJockey(j: JockeyResponse): JockeyCard {
  return {
    userId: j.userId,
    id: j.userCode || j.userId,
    fullName: j.fullName,
    avatarUrl: j.avatarUrl,
    status: j.status ?? 'PRO',
    winCount: j.winCount ?? 0,
    bodyWeight: j.bodyWeight ?? 0,
    rating: j.rating ?? 0,
    compatibility: null,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : '—',
    winRate2km: j.winRate ?? 0,
    last5: (j.recentForm ?? []).map((f) => f === 'W'),
    baseFee: j.baseFee != null ? `$${j.baseFee.toLocaleString('en-US')}` : '—',
    prizePct: j.prizePercent != null ? `${j.prizePercent}% of Purse` : '—',
    trophyCabinet: j.lastTrophy ?? '—',
  };
}

/** GET /jockeys → marketplace cards (real fields, no compatibility yet). */
export async function fetchJockeys(): Promise<JockeyCard[]> {
  const { data } = await apiClient.get<{ data: JockeyResponse[] | { content?: JockeyResponse[] } }>(
    '/jockeys',
  );
  return toArray(data.data).map(mapJockey);
}

/** GET /owner/unassigned-entries → left-rail rows. */
export async function fetchUnassignedEntries(): Promise<UnassignedHorse[]> {
  const { data } = await apiClient.get<{
    data: UnassignedEntryResponse[] | { content?: UnassignedEntryResponse[] };
  }>('/owner/unassigned-entries');
  return toArray(data.data).map((e) => ({
    // A horse (registrationId) can be entered in multiple races, so the row id
    // must combine registration + race to stay unique.
    id: `${e.registrationId}-${e.raceId}`,
    name: e.horseName,
    race: e.raceName,
    date: e.raceDate,
    raceId: e.raceId,
    horseId: e.horseId,
  }));
}

/** GET /races/{raceId}/jockey-suggestions?horseId={horseId} → compatibility scores. */
export async function fetchJockeySuggestions(
  raceId: string,
  horseId: string,
): Promise<JockeySuggestion[]> {
  const { data } = await apiClient.get<{
    data: JockeySuggestion[] | { content?: JockeySuggestion[] };
  }>(`/races/${raceId}/jockey-suggestions`, { params: { horseId } });
  return toArray(data.data);
}

/** GET /races/{raceId} → "Selected Race Details" view model. */
export async function fetchRaceDetail(raceId: string): Promise<RaceDetail> {
  const { data } = await apiClient.get<{ data: RaceResponse }>(`/races/${raceId}`);
  const r = data.data;
  return {
    course: r.tournamentName ?? '—',
    distance: r.distanceMeter != null ? `${r.distanceMeter}m` : '—',
    grade: r.raceType ?? '—',
    purse: '—',
  };
}

export function findEntryId(entries: RaceEntryLite[], horseId: string): string | null {
  return entries.find((e) => e.horseId === horseId)?.entryId ?? null;
}

export function mapInvitation(r: InvitationResponse): Invitation {
  return {
    id: r.assignmentId,
    status: r.status,
    invitedAt: r.invitedAt,
    horse: r.horseName,
    race: r.raceName,
    tournament: r.tournamentName ?? '—',
    jockey: r.jockeyName,
    jockeyAvatarUrl: r.jockeyAvatarUrl,
  };
}

/** Resolve the owner's entryId for a horse in a race (invite needs entryId, not registrationId). */
export async function resolveEntryId(raceId: string, horseId: string): Promise<string | null> {
  const { data } = await apiClient.get<{ data: RaceEntryLite[] | { content?: RaceEntryLite[] } }>(
    `/races/${raceId}/entries`,
  );
  const entries = Array.isArray(data.data) ? data.data : (data.data.content ?? []);
  return findEntryId(entries, horseId);
}

export async function sendInvitation(entryId: string, jockeyUserId: string): Promise<void> {
  await apiClient.post('/assignments/invitations', { entryId, jockeyUserId });
}

export async function fetchMyInvitations(): Promise<Invitation[]> {
  const { data } = await apiClient.get<{
    data: InvitationResponse[] | { content?: InvitationResponse[] };
  }>('/assignments/invitations');
  const list = Array.isArray(data.data) ? data.data : (data.data.content ?? []);
  return list.map(mapInvitation);
}

export async function cancelInvitation(assignmentId: string): Promise<void> {
  await apiClient.delete(`/assignments/invitations/${assignmentId}`);
}
