// ----- BE DTOs (real endpoints) -----

/** GET /jockeys/{id} → JockeyResponse */
export interface JockeyResponse {
  userId: string;
  userCode: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string | null;
  licenseNo: string | null;
  bodyWeight: number | null;
  heightCm: number | null;
  experienceYrs: number | null;
  winCount: number | null;
  bio: string | null;
  rating: number | null;
  ridingStyle: string | null;
  /** Win rate as a percentage number, e.g. 24.8 means 24.8%. */
  winRate: number | null;
  recentForm: string[] | null;
  baseFee: number | null;
  prizePercent: number | null;
  lastTrophy: string | null;
}

/**
 * GET /assignments/invitations?jockeyUserId={id}&status={...} → InvitationResponse[]
 * (may also arrive as a Spring Page { content }).
 */
export interface InvitationResponse {
  assignmentId: string;
  status: InvitationStatus;
  invitedAt: string;
  horseName: string;
  horseCode: string;
  raceId: string;
  raceName: string;
  raceCode: string | null;
  scheduledStartAt: string | null;
  trackCondition: string | null;
  distanceMeter: number | null;
  tournamentName: string | null;
  tournamentLocation: string | null;
  ownerName: string | null;
  jockeyName: string;
  jockeyAvatarUrl: string | null;
  entryNo: number | null;
  entryCode: string | null;
  // ----- prize fields (REAL, BE jockey contract #5) -----
  racePurse: number | null;
  jockeySharePercent: number | null;
  estimatedShare: number | null;
}

/** GET /jockeys/me/stats → JockeyStatsResponse (BE jockey contract #1). */
export interface JockeyStatsResponse {
  winRate: number;
  totalRides: number;
  wins: number;
  places: number;
  top3Rate: number;
  avgPlacement: number;
  careerWins: number;
  seasonEarnings: number;
  careerEarnings: number;
}

/** GET /jockeys/me/invitation-insights → InvitationInsightsResponse (#11). */
export interface InvitationInsightsResponse {
  invitationsThisWeek: number;
  weekDelta: number;
  acceptanceRate: number;
  mostActiveOwners: { ownerUserId: string; name: string; requests: number }[];
}

/** GET /assignments/me/rides?when=PAST|UPCOMING → JockeyRideResponse[] (#6). */
export interface JockeyRideResponse {
  raceId: string;
  raceName: string;
  venue: string;
  /** ISO datetime of the race — null when the race has no scheduled start yet. */
  date: string | null;
  horseName: string;
  /** Past rides only; null for upcoming (race not run yet). */
  finishPosition: number | null;
  earnings: number | null;
}

// ----- View models (the shape the pages render) -----

export type InvitationStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

/** Jockey profile header card. */
export interface JockeyProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** Win rate as a percentage number, e.g. 24.8. */
  winRate: number;
  careerWins: number;
  ridingStyle: string;
}

/** A single invitation row/card. All fields REAL (from InvitationResponse). */
export interface Invitation {
  id: string;
  status: InvitationStatus;
  horse: string;
  horseCode: string;
  owner: string;
  race: string;
  raceCode: string;
  tournament: string;
  tournamentLocation: string;
  /** ISO datetime of the scheduled race start. */
  date: string;
  distanceMeter: number;
  trackCondition: string;
  entryNo: number | null;
  entryCode: string;
  // ----- prize (REAL) -----
  prizePool: number;
  sharePct: number;
  estShare: number;
}

/** One row of the derived jockey leaderboard (from GET /jockeys). */
export interface LeaderboardEntry {
  rank: number;
  jockeyUserId: string;
  name: string;
  /** 2-letter initials used as the flag-style chip. */
  code: string;
  /** Ranking metric — career win count. */
  wins: number;
}

/** A schedule/result ride VM (from JockeyRideResponse). */
export interface JockeyRide {
  id: string;
  raceId: string;
  raceName: string;
  venue: string;
  /** null when the race has no scheduled start yet. */
  date: string | null;
  horse: string;
  finishPosition: number | null;
  earnings: number | null;
}

/** One point of the derived win-trend (wins per calendar month). */
export interface WinTrendPoint {
  month: string;
  wins: number;
}

/** A derived trophy = a race the jockey won (finishPosition === 1). */
export interface Trophy {
  name: string;
  year: number;
}

/** GET /horses/{id}/ride-intelligence → RideIntelligenceResponse (BE contract #7).
 *  All fields nullable; `formNotes` is always null today; `preferredSurface` is
 *  UPPER-CASE (e.g. "TURF") and should be humanized for display. */
export interface RideIntelligenceResponse {
  preferredSurface: string | null;
  /** ISO datetime of the horse's next race — format to HH:mm for display. */
  postTime: string | null;
  trainer: string | null;
  owner: string | null;
  /** Up-to-3 recent finishes joined with '-', e.g. "1-2-1". */
  recentForm: string | null;
  formNotes: string | null;
}

/** One entry of GET /races/{raceId}/entries — used to resolve horseId by name. */
export interface RaceEntryLite {
  horseId: string;
  horseName: string;
}

/** PUT /jockeys/me body (BE contract #8) — PARTIAL: omitted fields stay untouched
 *  (the endpoint cannot null-out an existing value). */
export interface UpdateJockeyProfileRequest {
  bodyWeight?: number;
  heightCm?: number;
  ridingStyle?: string;
  bio?: string;
  licenseNo?: string;
  baseFee?: number;
  prizePercent?: number;
}

/** Full jockey profile for the self-edit screen (editable + read-only display). */
export interface JockeyProfileDetail {
  id: string;
  // ----- editable (sent to PUT /jockeys/me) -----
  bodyWeight: number | null;
  heightCm: number | null;
  ridingStyle: string | null;
  bio: string | null;
  licenseNo: string | null;
  baseFee: number | null;
  prizePercent: number | null;
  // ----- read-only display -----
  fullName: string;
  email: string;
  phone: string;
  status: string;
  avatarUrl: string | null;
  winCount: number | null;
  experienceYrs: number | null;
  rating: number | null;
  winRate: number | null;
  recentForm: string[];
  lastTrophy: string | null;
}
