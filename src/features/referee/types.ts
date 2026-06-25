// ===== Referee feature — all data is REAL (BE shipped the referee endpoints). =====
// BE wraps every payload in ApiResponse<T> = { success, message, data, timestamp }.

// ---------- enums (match BE CHECK constraints) ----------
export type InspectionStatus = 'CLEARED' | 'PENDING' | 'VET_CHECK';
export type InfractionType = 'BUMPING' | 'INTERFERENCE' | 'WHIP_USAGE' | 'CROWDING' | 'OTHER';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ViolationStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type OfficialityStatus = 'PROVISIONAL' | 'UNDER_REVIEW' | 'OFFICIAL' | 'AMENDED';
export type PenaltyType = 'WARNING' | 'TIME_PENALTY' | 'FINE' | 'DISQUALIFICATION' | 'SUSPENSION';
export type RegistrationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

// ---------- Dashboard — GET /referee/dashboard ----------
export interface RefereeDashboardResponse {
  nextRace: {
    raceId: string;
    raceCode: string;
    name: string;
    scheduledStartAt: string | null;
    postTimeCountdownSeconds: number | null;
    status: string;
  } | null;
  alerts: {
    type: string;
    severity: string;
    raceId: string | null;
    entryId: string | null;
    refId: string | null;
    label: string;
  }[];
  inspectionSummary: { cleared: number; pending: number; vetCheck: number; total: number };
  dutyRoster: {
    refereeUserId: string;
    refereeName: string;
    panelRole: string;
    station: string | null;
  }[];
}

// ---------- Pre-Race Inspection ----------
/** GET /races/{raceId}/inspections */
export interface InspectionListItem {
  inspectionId: string | null;
  entryId: string;
  laneNo: number | null;
  horseId: string;
  horseName: string;
  jockeyName: string | null;
  healthCertPassed: boolean;
  weightVerified: boolean;
  inspectionStatus: InspectionStatus;
  inspectedAt: string | null;
}
/** POST /races/{raceId}/inspections body */
export interface InspectionRequest {
  entryId: string;
  healthCertPassed: boolean;
  weightVerified: boolean;
  weightCarriedLbs?: number;
  cogginsTestPassed: boolean;
  preRaceExamPassed: boolean;
  inspectionStatus: InspectionStatus;
  stewardNote?: string;
}
/** PATCH /races/{raceId}/inspections/submit-all → SubmitAllResponse */
export interface SubmitAllResponse {
  raceId: string;
  submittedCount: number;
  blockedEntries: { entryId: string; horseName: string; reason: string }[];
}

// ---------- Violations ----------
/** GET /races/{raceId}/violations and GET /violations */
export interface ViolationListItem {
  violationId: string;
  entityLabel: string;
  infractionType: InfractionType;
  severity: SeverityLevel;
  turnNo: number | null;
  raceTimeOffsetMs: number | null;
  status: ViolationStatus;
  createdAt: string;
}
/** GET /violations/{id} */
export interface ViolationDetail {
  violationId: string;
  raceId: string;
  entryId: string | null;
  horseName: string | null;
  jockeyName: string | null;
  infractionType: InfractionType;
  severity: SeverityLevel;
  turnNo: number | null;
  raceTimeOffsetMs: number | null;
  remarks: string | null;
  regulatoryRef: string | null;
  regulatoryText: string | null;
  footageAttachmentId: string | null;
  footageUrl: string | null;
  status: ViolationStatus;
  reportedByUserId: string | null;
  createdAt: string;
  ruling: {
    decisionType: string;
    penaltyType: PenaltyType | null;
    penaltyValue: string | null;
    ruledByName: string | null;
    ruledAt: string | null;
  } | null;
}
/** POST /races/{raceId}/violations body */
export interface CreateViolationRequest {
  entryId?: string;
  infractionType: InfractionType;
  severity: SeverityLevel;
  turnNo?: number;
  raceTimeOffsetMs?: number;
  remarks?: string;
  regulatoryRef?: string;
  footageAttachmentId?: string;
}
/** PATCH /violations/{id}/ruling body */
export interface RulingRequest {
  decisionType: string;
  penaltyType?: PenaltyType;
  timePenaltyMs?: number;
  fineAmount?: number;
  rulingNotes?: string;
}

// ---------- Results ----------
/** GET /races/{raceId}/results */
export interface RaceResults {
  raceId: string;
  officialityStatus: OfficialityStatus;
  winningTimeMs: number | null;
  trackCondition: string | null;
  trackBias: string | null;
  windSpeedKph: number | null;
  fractions: string[] | null;
  photofinishUrl: string | null;
  order: ResultRow[];
}
export interface ResultRow {
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
/** PATCH /races/{raceId}/results/certify body */
export interface CertifyResultsRequest {
  chiefStewardPin: string;
  acknowledgeInquiriesResolved?: boolean;
  stewardsReport?: string;
}
export interface CertifyResultsResponse {
  raceId: string;
  raceStatus: string;
  officialityStatus: OfficialityStatus;
  certifiedByName: string | null;
  publishedAt: string | null;
  openInquiries: number;
}

// ---------- Live monitor — GET /races/{raceId}/live ----------
export interface LiveRace {
  raceId: string;
  raceClockMs: number | null;
  videoFeedUrl: string | null;
  windSpeedKph: number | null;
  windDirection: string | null;
  runningOrder: {
    position: number | null;
    entryNo: number | null;
    horseName: string;
    jockeyName: string | null;
    currentSpeedKph: number | null;
  }[];
}

// ---------- Registration management ----------
/** GET /registrations → Page<RegistrationResponse> */
export interface RegistrationResponse {
  registrationId: string;
  registrationCode: string;
  status: RegistrationStatus;
  ownerUserId: string | null;
  ownerName: string | null;
  tournamentId: string | null;
  tournamentName: string | null;
  horseId: string | null;
  horseName: string | null;
  horseCode: string | null;
  raceId: string | null;
  raceName: string | null;
  category: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}
/** GET /registrations/stats */
export interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
/** Digital Passport (Pre-Race Inspection) — from /horses/{id} (+pedigree for trainer). */
export interface HorsePassport {
  horseId: string;
  name: string;
  microchipNo: string | null;
  ageYears: number | null;
  genderWord: string;
  trainer: string | null;
  owner: string | null;
}

/** Horse verification panel (assembled from /horses/{id} + pedigree + medical-status). */
export interface HorseVerification {
  horseId: string;
  name: string;
  microchipNo: string | null;
  ageYears: number | null;
  genderWord: string;
  breed: string | null;
  sireName: string | null;
  damName: string | null;
  vaccinationsUpToDate: boolean | null;
  fitnessCertified: boolean | null;
  passportScanStatus: string | null;
  healthStatus: string | null;
}

// ---------- shared race context (reused read endpoints) ----------
export interface RefereeRace {
  raceId: string;
  raceCode: string | null;
  name: string;
  scheduledStartAt: string | null;
  status: string;
  trackCondition: string | null;
}
