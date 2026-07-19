// ----- BE DTOs (real endpoints) -----

/** GET /races → Spring Page<RaceResponse>. */
export interface RaceResponse {
  raceId: string;
  raceCode: string;
  name: string;
  raceType: string | null;
  distanceMeter: number | null;
  trackCondition: string | null;
  scheduledStartAt: string | null;
  tournamentName: string | null;
}

/** GET /races/{id}/entries → RaceEntryResponse[]. */
export interface RaceEntryResponse {
  entryNo: number;
  laneNo: number | null;
  drawStall: string | null;
  horseName: string;
  ownerName: string;
  jockeyName: string | null;
  weightCarriedLbs: number | null;
  recentForm: string | null;
  odds: string | null;
  status: string;
}

/** GET /races/{raceId}/my-entry → the current owner's entry, or null when they have none. */
export interface MyEntryResponse {
  horseName: string;
  drawStall: string | null;
  jockeyName: string | null;
  weightCarriedLbs: number | null;
  entryStatus: string;
}

// ----- View models (the shape the page renders) -----

/** A single runner row in the Official Entries table. */
export interface EntryRow {
  entryNo: number;
  horseName: string;
  trainer: string;
  jockey: string;
  weight: string;
  last5: string;
  odds: string;
  yours: boolean;
}

/** The current owner's horse in this race (null when they have no entry). */
export interface YourHorse {
  name: string;
  drawStall: string;
  jockey: string;
  weight: string;
  status: string;
}

/** A historical winner row. STATIC — BE does not expose these. */
export interface HistoricalWin {
  horse: string;
  year: number;
  time: string;
  record: boolean;
}

/** A prize-money tier bar. STATIC — BE does not expose these. */
export interface PrizeTier {
  place: string;
  amount: number;
  label: string;
}

/** The complete view model the Race Details page renders. */
export interface RaceDetailsVM {
  // From BE
  raceName: string;
  tournamentName: string;
  venue: string;
  scheduledStartAt: string | null;
  distanceMeter: number;
  raceTypeLabel: string;
  entries: EntryRow[];
  yourHorse: YourHorse | null;
  // STATIC — BE does not expose these.
  going: { label: string; moisture: string };
  distance: { label: string; meters: string };
  raceTypeTile: { label: string; sub: string };
  historicalWins: HistoricalWin[];
  prizeTiers: PrizeTier[];
  totalPurse: string;
}

// ----- Race Report (results announcement + stewards report + violations) -----

export interface ReportResultRow {
  resultId: string;
  finishPosition: number | null;
  entryNo: number | null;
  horseName: string;
  jockeyName: string | null;
  weightCarriedLbs: number | null;
  finishTimeMs: number | null;
  lengthsBehind: number | null;
  odds: string | null;
}

/** GET /races/{id}/results */
export interface RaceResultSheet {
  raceId: string;
  officialityStatus: string;
  winningTimeMs: number | null;
  trackCondition: string | null;
  trackBias: string | null;
  windSpeedKph: number | null;
  fractions: string[] | null;
  photofinishUrl: string | null;
  stewardsReport: string | null;
  order: ReportResultRow[];
}

/** GET /races/{id}/violations */
export interface ReportViolation {
  violationId: string;
  entityLabel: string;
  infractionType: string;
  severity: string;
  turnNo: number | null;
  raceTimeOffsetMs: number | null;
  status: string;
  createdAt: string;
}
