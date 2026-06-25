// ----- BE DTOs (real endpoints) -----

/** GET /jockeys → JockeyResponse[] */
export interface JockeyResponse {
  userId: string;
  userCode: string;
  fullName: string;
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
  winRate: number | null;
  recentForm: string[] | null;
  baseFee: number | null;
  prizePercent: number | null;
  lastTrophy: string | null;
}

/** GET /owner/unassigned-entries → UnassignedEntryResponse[] */
export interface UnassignedEntryResponse {
  registrationId: string;
  horseId: string;
  horseName: string;
  raceId: string;
  raceName: string;
  raceDate: string;
}

/** GET /races/{raceId}/jockey-suggestions?horseId={horseId} → JockeySuggestion[] */
export interface JockeySuggestion {
  jockeyUserId: string;
  compatibility: number;
}

/** GET /races/{raceId} → RaceResponse (subset used for "Selected Race Details") */
export interface RaceResponse {
  name: string;
  raceType: string | null;
  distanceMeter: number | null;
  trackCondition: string | null;
  tournamentName: string | null;
}

// ----- View models (the shape the page renders) -----

/** A jockey card on the marketplace. */
export interface JockeyCard {
  userId: string;
  id: string;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  winCount: number;
  bodyWeight: number;
  rating: number;
  /** Only known when a horse is selected; null otherwise. */
  compatibility: number | null;
  ridingStyle: string;
  last5: boolean[];
  winRate2km: number;
  baseFee: string;
  prizePct: string;
  trophyCabinet: string;
}

/** An unassigned horse row in the left rail. */
export interface UnassignedHorse {
  id: string;
  name: string;
  race: string;
  date: string;
  raceId: string;
  horseId: string;
}

/** The selected race detail block. */
export interface RaceDetail {
  course: string;
  distance: string;
  grade: string;
  purse: string;
}

// ----- Invitations -----

export type InvitationStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface InvitationResponse {
  assignmentId: string;
  status: InvitationStatus;
  invitedAt: string;
  horseName: string;
  horseCode: string;
  raceName: string;
  scheduledStartAt: string | null;
  tournamentName: string | null;
  jockeyName: string;
  jockeyAvatarUrl: string | null;
  entryNo: number | null;
}

export interface Invitation {
  id: string;
  status: InvitationStatus;
  invitedAt: string;
  horse: string;
  race: string;
  tournament: string;
  jockey: string;
  jockeyAvatarUrl: string | null;
}

export interface RaceEntryLite {
  entryId: string;
  horseId: string;
}
