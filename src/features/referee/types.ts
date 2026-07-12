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
  | 'WITHDRAWN'
  | 'REMOVED';

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
  /** Referee's per-race code (admin-issued); required for referees. */
  refCode?: string;
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
  /** Horses approved for this tournament that were not entered in this race. */
  registeredNotEntered?: RegisteredNotEnteredRow[] | null;
}
/** A tournament-approved runner that was never entered in the race. */
export interface RegisteredNotEnteredRow {
  registrationId: string;
  registrationCode: string | null;
  horseId: string | null;
  horseName: string | null;
  ownerName: string | null;
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
  /** CN3: set once the referee publishes the report; a truthy value locks the row for referees. */
  refereeSubmittedAt?: string | null;
  /** Per-row officiality (a row goes UNDER_REVIEW when an inquiry is raised). */
  officialityStatus?: OfficialityStatus;
}
/** A single order-of-finish row submitted via record/report. */
export interface ResultInput {
  entryId: string;
  finishPosition?: number;
  finishTimeMs?: number;
  lengthsBehind?: number;
  score?: number;
}
/** POST /races/{raceId}/report body (CN3: emailed OTP + combined race report). */
export interface SubmitReportRequest {
  otp: string;
  results: ResultInput[];
  violations: CreateViolationRequest[];
}
/** POST /races/{raceId}/report response (matches BE SubmitReportResponse). */
export interface SubmitReportResponse {
  raceId: string;
  results: ResultRow[];
  violationIds: string[];
  submittedAt: string | null;
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

// ---------- Document review (CN2) ----------
export type DocumentReviewStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/** AttachmentResponse — a document attached to an owner or a horse. */
export interface Attachment {
  attachmentId: string;
  ownerEntityType: string;
  ownerEntityId: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  url: string;
  sensitivityLevel: string | null;
  uploadedAt: string | null;
}

/** GET /races/{raceId}/entry-reviews → EntryReviewResponse[]. */
export interface EntryReview {
  entryId: string;
  entryNo: number | null;
  horseName: string;
  ownerName: string | null;
  documentStatus: DocumentReviewStatus;
  reviewReason: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  ownerDocs: Attachment[];
  horseDocs: Attachment[];
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

// ---------- Referee — Applicant onboarding (Registration Approval) ----------
// SPEC-ONLY: BE endpoints under /referee/applications are not yet implemented.
// See docs/be-referee-onboarding-contracts-todo.md — UI degrades to loading/empty until they ship.
export type RequestedRole = 'OWNER' | 'TRAINER' | 'VET' | 'JOCKEY';
export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'INFO_REQUESTED' | 'APPROVED' | 'REJECTED';
export type ApplicationPriority = 'URGENT' | 'NORMAL';

/** GET /referee/applications → Page<ApplicationSummary> */
export interface ApplicationSummary {
  applicationId: string;
  applicationCode: string;
  fullName: string;
  requestedRole: RequestedRole;
  priority: ApplicationPriority | null;
  status: ApplicationStatus;
  submittedAt: string | null;
}

/** GET /referee/applications/{id} */
export interface ApplicationDetail {
  applicationId: string;
  applicationCode: string;
  fullName: string;
  requestedRole: RequestedRole;
  status: ApplicationStatus;
  avatarUrl: string | null;
  location: string | null;
  memberSince: string | null;
  dateOfBirth: string | null;
  taxIdMasked: string | null;
  email: string | null;
  phone: string | null;
  businessAffiliation: { orgName: string | null; horsesRegistered: number | null } | null;
  eligibility: {
    idVerification: { status: string | null; documentRef: string | null } | null;
    license: { class: string | null; status: string | null; validUntil: string | null } | null;
    backgroundCheck: { status: string | null } | null;
  } | null;
  /** JOCKEY applicants only — auth-gated document download paths (null otherwise). */
  jockeyLicenseUrl: string | null;
  jockeyFitnessCertificateUrl: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  rejectionReason: string | null;
}

/** GET /referee/applications/stats */
export interface ApplicationStats {
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
}
