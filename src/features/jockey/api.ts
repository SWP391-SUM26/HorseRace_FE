import { apiClient } from '@/common/lib/apiClient';
import { initials } from '@/common/lib/format';
import type {
  Invitation,
  InvitationInsightsResponse,
  InvitationResponse,
  InvitationStatus,
  JockeyProfile,
  JockeyProfileDetail,
  JockeyResponse,
  JockeyRide,
  JockeyRideResponse,
  JockeyStatsResponse,
  LeaderboardEntry,
  RaceEntryLite,
  RideIntelligenceResponse,
  Trophy,
  UpdateJockeyProfileRequest,
  WinTrendPoint,
} from './types';

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "STALKER" -> "Stalker", "FRONT_RUNNER" -> "Front Runner". */
export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mapProfile(j: JockeyResponse): JockeyProfile {
  return {
    id: j.userId,
    name: j.fullName,
    avatarUrl: j.avatarUrl,
    winRate: j.winRate ?? 0,
    careerWins: j.winCount ?? 0,
    ridingStyle: j.ridingStyle ? humanize(j.ridingStyle) : '—',
  };
}

/** Map a BE invitation to the card/modal VM — all fields REAL. */
function mapInvitation(r: InvitationResponse): Invitation {
  return {
    id: r.assignmentId,
    status: r.status,
    horse: r.horseName,
    horseCode: r.horseCode,
    owner: r.ownerName ?? '—',
    race: r.raceName,
    raceCode: r.raceCode ?? '—',
    tournament: r.tournamentName ?? '—',
    tournamentLocation: r.tournamentLocation ?? '—',
    date: r.scheduledStartAt ?? r.invitedAt,
    distanceMeter: r.distanceMeter ?? 0,
    trackCondition: r.trackCondition ?? '—',
    entryNo: r.entryNo,
    entryCode: r.entryCode ?? '—',
    // ----- prize (REAL) -----
    prizePool: r.racePurse ?? 0,
    sharePct: Number(r.jockeySharePercent ?? 0),
    estShare: r.estimatedShare ?? 0,
  };
}

/** GET /jockeys/{id} → jockey profile header VM (real fields only). */
export async function fetchJockeyProfile(id: string): Promise<JockeyProfile> {
  const { data } = await apiClient.get<{ data: JockeyResponse }>(`/jockeys/${id}`);
  return mapProfile(data.data);
}

/** GET /assignments/invitations?jockeyUserId=&status= → invitation VMs. */
export async function fetchJockeyInvitations(
  jockeyUserId: string,
  status: InvitationStatus,
): Promise<Invitation[]> {
  const { data } = await apiClient.get<{
    data: InvitationResponse[] | { content?: InvitationResponse[] };
  }>('/assignments/invitations', { params: { jockeyUserId, status } });
  return toArray(data.data).map(mapInvitation);
}

/** PATCH /assignments/invitations/{id}/accept → updated invitation. */
export async function acceptInvitation(id: string): Promise<Invitation> {
  const { data } = await apiClient.patch<{ data: InvitationResponse }>(
    `/assignments/invitations/${id}/accept`,
  );
  return mapInvitation(data.data);
}

/** PATCH /assignments/invitations/{id}/reject → updated invitation. */
export async function rejectInvitation(id: string): Promise<Invitation> {
  const { data } = await apiClient.patch<{ data: InvitationResponse }>(
    `/assignments/invitations/${id}/reject`,
  );
  return mapInvitation(data.data);
}

/** PATCH /assignments/invitations/{id}/withdraw → ACCEPTED ride → CANCELLED (BE contract #9). */
export async function withdrawInvitation(id: string): Promise<Invitation> {
  const { data } = await apiClient.patch<{ data: InvitationResponse }>(
    `/assignments/invitations/${id}/withdraw`,
  );
  return mapInvitation(data.data);
}

/** GET /jockeys/me/stats → aggregated performance + earnings (REAL, contract #1). */
export async function fetchJockeyStats(): Promise<JockeyStatsResponse> {
  const { data } = await apiClient.get<{ data: JockeyStatsResponse }>('/jockeys/me/stats');
  return data.data;
}

/** GET /jockeys/me/invitation-insights → REAL (contract #11). */
export async function fetchInvitationInsights(): Promise<InvitationInsightsResponse> {
  const { data } = await apiClient.get<{ data: InvitationInsightsResponse }>(
    '/jockeys/me/invitation-insights',
  );
  return data.data;
}

/** GET /assignments/me/rides?when=PAST|UPCOMING → the caller's ACCEPTED rides (REAL, #6). */
export async function fetchMyRides(when: 'PAST' | 'UPCOMING'): Promise<JockeyRide[]> {
  const { data } = await apiClient.get<{
    data: JockeyRideResponse[] | { content?: JockeyRideResponse[] };
  }>('/assignments/me/rides', { params: { when } });
  return toArray(data.data).map((r, i) => ({
    id: `${r.raceId}-${r.horseName}-${i}`,
    raceId: r.raceId,
    raceName: r.raceName,
    venue: r.venue,
    date: r.date,
    horse: r.horseName,
    finishPosition: r.finishPosition,
    earnings: r.earnings,
  }));
}

/**
 * Derived leaderboard — there is no BE ranking endpoint, so we sort the full
 * jockey roster (GET /jockeys) by career win count. Real data, no mock.
 */
export async function fetchLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<{
    data: JockeyResponse[] | { content?: JockeyResponse[] };
  }>('/jockeys');
  return toArray(data.data)
    .slice()
    .sort((a, b) => (b.winCount ?? 0) - (a.winCount ?? 0))
    .slice(0, limit)
    .map((j, i) => ({
      rank: i + 1,
      jockeyUserId: j.userId,
      name: j.fullName,
      code: initials(j.fullName) || '—',
      wins: j.winCount ?? 0,
    }));
}

// ----- Derivations from real ride history (no BE win-trend / trophy endpoint) -----

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Wins-per-month for the trailing 12 calendar months, derived from PAST rides
 * (a "win" = finishPosition === 1). Buckets with no wins render as zero so the
 * chart always shows a full 12-month axis.
 */
export function buildWinTrend(rides: JockeyRide[], now: Date = new Date()): WinTrendPoint[] {
  const buckets: { key: string; month: string; wins: number }[] = [];
  const index = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    index.set(key, buckets.length);
    buckets.push({ key, month: MONTH_ABBR[d.getUTCMonth()], wins: 0 });
  }
  for (const ride of rides) {
    if (ride.finishPosition !== 1 || !ride.date) continue;
    const d = new Date(ride.date);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const at = index.get(key);
    if (at != null) buckets[at].wins += 1;
  }
  return buckets.map(({ month, wins }) => ({ month, wins }));
}

/** Trophies = races won (finishPosition === 1), newest first, deduped by name+year. */
export function buildTrophies(rides: JockeyRide[]): Trophy[] {
  const seen = new Set<string>();
  const out: Trophy[] = [];
  const won = rides
    .filter((r) => r.finishPosition === 1 && r.date != null)
    .sort((a, b) => +new Date(b.date!) - +new Date(a.date!));
  for (const ride of won) {
    const year = new Date(ride.date!).getUTCFullYear();
    const key = `${ride.raceName}-${year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: ride.raceName, year });
  }
  return out;
}

// ----- Ride intelligence (REAL, BE contract #7) -----

/** GET /races/{raceId}/entries → minimal {horseId, horseName} list (to resolve horseId by name). */
export async function fetchRaceEntries(raceId: string): Promise<RaceEntryLite[]> {
  const { data } = await apiClient.get<{
    data: RaceEntryLite[] | { content?: RaceEntryLite[] };
  }>(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({ horseId: e.horseId, horseName: e.horseName }));
}

/** GET /horses/{id}/ride-intelligence → form profile for one horse. */
export async function fetchRideIntelligence(horseId: string): Promise<RideIntelligenceResponse> {
  const { data } = await apiClient.get<{ data: RideIntelligenceResponse }>(
    `/horses/${horseId}/ride-intelligence`,
  );
  return data.data;
}

// ----- Self-edit jockey profile (REAL, BE contract #8) -----

function mapProfileDetail(j: JockeyResponse): JockeyProfileDetail {
  return {
    id: j.userId,
    bodyWeight: j.bodyWeight,
    heightCm: j.heightCm,
    ridingStyle: j.ridingStyle,
    bio: j.bio,
    licenseNo: j.licenseNo,
    baseFee: j.baseFee,
    prizePercent: j.prizePercent,
    fullName: j.fullName,
    email: j.email ?? '—',
    phone: j.phone ?? '—',
    status: j.status ?? '—',
    avatarUrl: j.avatarUrl,
    winCount: j.winCount,
    experienceYrs: j.experienceYrs,
    rating: j.rating,
    winRate: j.winRate,
    recentForm: j.recentForm ?? [],
    lastTrophy: j.lastTrophy,
  };
}

/** GET /jockeys/{id} → full editable profile (seeds the self-edit form). */
export async function fetchJockeyDetail(id: string): Promise<JockeyProfileDetail> {
  const { data } = await apiClient.get<{ data: JockeyResponse }>(`/jockeys/${id}`);
  return mapProfileDetail(data.data);
}

/**
 * Build a PUT /jockeys/me body, dropping empty/undefined so the update stays
 * PARTIAL (the endpoint cannot null-out a value, so we only send filled fields).
 */
export function toUpdateJockeyProfileRequest(v: {
  bodyWeight?: number;
  heightCm?: number;
  ridingStyle?: string;
  bio?: string;
  licenseNo?: string;
  baseFee?: number;
  prizePercent?: number;
}): UpdateJockeyProfileRequest {
  const body: UpdateJockeyProfileRequest = {};
  if (v.bodyWeight != null) body.bodyWeight = v.bodyWeight;
  if (v.heightCm != null) body.heightCm = v.heightCm;
  if (v.baseFee != null) body.baseFee = v.baseFee;
  if (v.prizePercent != null) body.prizePercent = v.prizePercent;
  const ridingStyle = v.ridingStyle?.trim();
  if (ridingStyle) body.ridingStyle = ridingStyle;
  const bio = v.bio?.trim();
  if (bio) body.bio = bio;
  const licenseNo = v.licenseNo?.trim();
  if (licenseNo) body.licenseNo = licenseNo;
  return body;
}

/** PUT /jockeys/me → updated full profile. */
export async function updateMyJockeyProfile(
  body: UpdateJockeyProfileRequest,
): Promise<JockeyProfileDetail> {
  const { data } = await apiClient.put<{ data: JockeyResponse }>('/jockeys/me', body);
  return mapProfileDetail(data.data);
}
