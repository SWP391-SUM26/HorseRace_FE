import { apiClient } from '@/common/lib/apiClient';
import type {
  ApplicationDetail,
  ApplicationStats,
  ApplicationSummary,
  CertifyResultsRequest,
  CertifyResultsResponse,
  CreateViolationRequest,
  EntryReview,
  HorsePassport,
  HorseVerification,
  InspectionListItem,
  InspectionRequest,
  LiveRace,
  RaceResults,
  RefereeDashboardResponse,
  RefereeRace,
  RegistrationResponse,
  RegistrationStats,
  ResultInput,
  ResultRow,
  RulingRequest,
  SubmitAllResponse,
  SubmitReportResponse,
  ViolationDetail,
  ViolationListItem,
} from './types';

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray<T>(d: T[] | { content?: T[] } | undefined | null): T[] {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "WHIP_USAGE" -> "Whip Usage". */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------- Dashboard ----------
export async function fetchRefereeDashboard(): Promise<RefereeDashboardResponse> {
  const { data } = await apiClient.get<{ data: RefereeDashboardResponse }>('/referee/dashboard');
  return data.data;
}

// ---------- Races (scoped to the referee's assigned races) ----------
/** Race IDs the signed-in referee is assigned (by admin) to officiate. */
export async function fetchRefereeRaceIds(): Promise<string[]> {
  const { data } = await apiClient.get<{ data: string[] | null }>('/staffing/my-races');
  return data.data ?? [];
}

/** The signed-in referee's own assignments incl. the per-race code the admin issued. */
export interface MyAssignment {
  refAssignmentId: string;
  raceId: string;
  raceName: string | null;
  raceCode: string | null;
  panelRole: string | null;
  refCode: string | null;
  status: string | null;
  scheduledStartAt?: string | null;
  respondedAt?: string | null;
  declineReason?: string | null;
}

/** CN1: the referee's own per-race assignments they can accept/decline. */
export async function fetchMyRaceAssignments(): Promise<MyAssignment[]> {
  const { data } = await apiClient.get<{ data: MyAssignment[] | { content?: MyAssignment[] } }>('/referee/race-assignments');
  return toArray(data.data);
}
export async function acceptRaceAssignment(id: string): Promise<void> {
  await apiClient.patch(`/referee/race-assignments/${id}/accept`);
}
export async function declineRaceAssignment(id: string, reason?: string): Promise<void> {
  await apiClient.patch(`/referee/race-assignments/${id}/decline`, { reason });
}
export async function fetchMyAssignments(): Promise<MyAssignment[]> {
  const { data } = await apiClient.get<{ data: MyAssignment[] | { content?: MyAssignment[] } }>('/staffing/my-assignments');
  return toArray(data.data).map((a) => ({
    refAssignmentId: a.refAssignmentId,
    raceId: a.raceId,
    raceName: a.raceName ?? null,
    raceCode: a.raceCode ?? null,
    panelRole: a.panelRole ?? null,
    refCode: a.refCode ?? null,
    status: a.status ?? null,
  }));
}

/** A tournament-level invitation the admin sent this referee. */
export interface TournamentInvitation {
  id: string;
  tournamentId: string;
  tournamentName: string | null;
  refereeUserId: string;
  refereeName: string | null;
  panelRole: string | null;
  status: string;
  invitedAt: string | null;
  respondedAt: string | null;
}
export async function fetchMyTournamentInvitations(): Promise<TournamentInvitation[]> {
  const { data } = await apiClient.get<{ data: TournamentInvitation[] | { content?: TournamentInvitation[] } }>('/referee/invitations');
  return toArray(data.data);
}
export async function acceptTournamentInvitation(id: string): Promise<void> {
  await apiClient.patch(`/referee/invitations/${id}/accept`);
}
export async function rejectTournamentInvitation(id: string): Promise<void> {
  await apiClient.patch(`/referee/invitations/${id}/reject`);
}

export async function fetchRefereeRaces(): Promise<RefereeRace[]> {
  const [racesRes, ids] = await Promise.all([
    apiClient.get<{ data: RefereeRace[] | { content?: RefereeRace[] } }>('/races', {
      params: { size: 200, sortBy: 'scheduledStartAt', sortDir: 'desc' },
    }),
    fetchRefereeRaceIds(),
  ]);
  const assigned = new Set(ids);
  return toArray(racesRes.data.data)
    .filter((r) => assigned.has(r.raceId)) // only races an admin assigned to this referee
    .map((r) => ({
      raceId: r.raceId,
      raceCode: r.raceCode ?? null,
      name: r.name,
      scheduledStartAt: r.scheduledStartAt ?? null,
      status: r.status,
      trackCondition: r.trackCondition ?? null,
    }));
}

/** A single race with the extra fields the live monitor header shows. */
export interface RefereeRaceDetail extends RefereeRace {
  raceType: string | null;
  distanceMeter: number | null;
  tournamentName: string | null;
}

/**
 * GET /races/{id} — fetch one race directly. The scoped race list (`fetchRefereeRaces`) is capped,
 * so a deep-linked race outside that window still resolves through this single-race fetch.
 */
export async function fetchRefereeRace(raceId: string): Promise<RefereeRaceDetail> {
  const { data } = await apiClient.get<{
    data: {
      raceId: string;
      raceCode?: string | null;
      name: string;
      raceType?: string | null;
      distanceMeter?: number | null;
      scheduledStartAt?: string | null;
      status: string;
      trackCondition?: string | null;
      tournamentName?: string | null;
    };
  }>(`/races/${raceId}`);
  const r = data.data;
  return {
    raceId: r.raceId,
    raceCode: r.raceCode ?? null,
    name: r.name,
    scheduledStartAt: r.scheduledStartAt ?? null,
    status: r.status,
    trackCondition: r.trackCondition ?? null,
    raceType: r.raceType ?? null,
    distanceMeter: r.distanceMeter ?? null,
    tournamentName: r.tournamentName ?? null,
  };
}

// ---------- Document review (CN2) ----------
/** GET /races/{raceId}/entry-reviews — one row per runner with its owner + horse docs. */
export async function fetchEntryReviews(raceId: string): Promise<EntryReview[]> {
  const { data } = await apiClient.get<{ data: EntryReview[] | { content?: EntryReview[] } }>(
    `/races/${raceId}/entry-reviews`,
  );
  return toArray(data.data);
}

/** PATCH /races/{raceId}/entries/{entryId}/accept — clear the entry's documents. */
export async function acceptEntry(raceId: string, entryId: string): Promise<EntryReview> {
  const { data } = await apiClient.patch<{ data: EntryReview }>(
    `/races/${raceId}/entries/${entryId}/accept`,
  );
  return data.data;
}

/** PATCH /races/{raceId}/entries/{entryId}/reject — reject with a required reason. */
export async function rejectEntry(raceId: string, entryId: string, reason: string): Promise<EntryReview> {
  const { data } = await apiClient.patch<{ data: EntryReview }>(
    `/races/${raceId}/entries/${entryId}/reject`,
    { reason },
  );
  return data.data;
}

// ---------- Pre-Race Inspection ----------
export async function fetchInspections(raceId: string): Promise<InspectionListItem[]> {
  const { data } = await apiClient.get<{
    data: InspectionListItem[] | { content?: InspectionListItem[] };
  }>(`/races/${raceId}/inspections`);
  return toArray(data.data);
}

export async function recordInspection(raceId: string, body: InspectionRequest): Promise<void> {
  await apiClient.post(`/races/${raceId}/inspections`, body);
}

export async function submitAllInspections(raceId: string): Promise<SubmitAllResponse> {
  const { data } = await apiClient.patch<{ data: SubmitAllResponse }>(
    `/races/${raceId}/inspections/submit-all`,
    { confirm: true },
  );
  return data.data;
}

// ---------- Violations ----------
export async function fetchRaceViolations(raceId: string): Promise<ViolationListItem[]> {
  const { data } = await apiClient.get<{
    data: ViolationListItem[] | { content?: ViolationListItem[] };
  }>(`/races/${raceId}/violations`);
  return toArray(data.data);
}

export async function fetchViolation(violationId: string): Promise<ViolationDetail> {
  const { data } = await apiClient.get<{ data: ViolationDetail }>(`/violations/${violationId}`);
  return data.data;
}

export async function createViolation(
  raceId: string,
  body: CreateViolationRequest,
): Promise<ViolationDetail> {
  const { data } = await apiClient.post<{ data: ViolationDetail }>(
    `/races/${raceId}/violations`,
    body,
  );
  return data.data;
}

export async function recordRuling(
  violationId: string,
  body: RulingRequest,
): Promise<void> {
  await apiClient.patch(`/violations/${violationId}/ruling`, body);
}

export async function updateViolation(violationId: string, body: CreateViolationRequest): Promise<void> {
  await apiClient.put(`/violations/${violationId}`, body);
}

export async function deleteViolation(violationId: string): Promise<void> {
  await apiClient.delete(`/violations/${violationId}`);
}

/** Race entries (runners) for the violation entry picker. */
export interface RaceEntryLite { entryId: string; entryNo: number | null; horseName: string }
export async function fetchRaceEntries(raceId: string): Promise<RaceEntryLite[]> {
  const { data } = await apiClient.get<{ data: RaceEntryLite[] | { content?: RaceEntryLite[] } }>(`/races/${raceId}/entries`);
  return toArray(data.data).map((e) => ({ entryId: e.entryId, entryNo: e.entryNo ?? null, horseName: e.horseName }));
}

// ---------- Results ----------
export async function fetchResults(raceId: string): Promise<RaceResults | null> {
  const { data } = await apiClient.get<{ data: RaceResults | null }>(`/races/${raceId}/results`);
  return data.data;
}

/** ADMIN-ONLY legacy path — records provisional results directly (no OTP, no refCode). */
export async function recordResults(
  raceId: string,
  results: ResultInput[],
): Promise<ResultRow[]> {
  const { data } = await apiClient.post<{ data: ResultRow[] }>(`/races/${raceId}/results`, {
    results,
  });
  return data.data;
}

/** CN3: email a fresh 6-digit OTP to the referee's verified address for this race. */
export async function requestRefereeCode(raceId: string): Promise<void> {
  await apiClient.post(`/races/${raceId}/referee-code/request`);
}

/** CN3: publish the combined race report (results + violations), authorised by the emailed OTP. */
export async function submitReport(
  raceId: string,
  body: { otp: string; results: ResultInput[]; violations: CreateViolationRequest[] },
): Promise<SubmitReportResponse> {
  const { data } = await apiClient.post<{ data: SubmitReportResponse }>(
    `/races/${raceId}/report`,
    body,
  );
  return data.data;
}

/** CN3: flag one result row UNDER_REVIEW (referee/admin), pre-certification. */
export async function flagInquiry(raceId: string, resultId: string): Promise<void> {
  await apiClient.patch(`/races/${raceId}/results/${resultId}/inquiry`);
}

/** Delete one provisional result row (ADMIN-ONLY; blocked once OFFICIAL). */
export async function deleteResult(raceId: string, resultId: string): Promise<void> {
  await apiClient.delete(`/races/${raceId}/results/${resultId}`);
}

/** Upload an image and get back its public URL + id (for violation footage etc.). */
export interface UploadedAttachment { attachmentId: string; url: string; fileName: string }
export async function uploadAttachment(
  file: File,
  ownerEntityType: string,
  ownerEntityId?: string,
): Promise<UploadedAttachment> {
  const form = new FormData();
  form.append('file', file);
  form.append('ownerEntityType', ownerEntityType);
  if (ownerEntityId) form.append('ownerEntityId', ownerEntityId);
  const { data } = await apiClient.post<{ data: UploadedAttachment }>('/attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function certifyResults(
  raceId: string,
  body: CertifyResultsRequest,
): Promise<CertifyResultsResponse> {
  const { data } = await apiClient.patch<{ data: CertifyResultsResponse }>(
    `/races/${raceId}/results/certify`,
    body,
  );
  return data.data;
}

// ---------- Live monitor ----------
export async function fetchLiveRace(raceId: string): Promise<LiveRace> {
  const { data } = await apiClient.get<{ data: LiveRace }>(`/races/${raceId}/live`);
  return data.data;
}

// ---------- Registration management ----------
export interface RegistrationQuery {
  q?: string;
  status?: string;
  tournamentId?: string;
  category?: string;
  page?: number;
  size?: number;
}

export async function fetchRegistrations(query: RegistrationQuery): Promise<{
  rows: RegistrationResponse[];
  totalPages: number;
  page: number;
}> {
  const { data } = await apiClient.get<{
    data: RegistrationResponse[] | { content?: RegistrationResponse[]; totalPages?: number; number?: number };
  }>('/registrations', { params: { size: 10, ...query } });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return { rows: d?.content ?? [], totalPages: d?.totalPages ?? 1, page: d?.number ?? 0 };
}

export async function fetchRegistrationStats(): Promise<RegistrationStats> {
  const { data } = await apiClient.get<{ data: RegistrationStats }>('/registrations/stats');
  return data.data;
}

export async function approveRegistration(id: string): Promise<void> {
  await apiClient.patch(`/registrations/${id}/approve`);
}

export async function rejectRegistration(id: string, reason: string): Promise<void> {
  await apiClient.patch(`/registrations/${id}/reject`, { reason });
}

/** DELETE /registrations/{id} — referee/admin soft-remove (sets status REMOVED). */
export async function deleteRegistration(id: string): Promise<void> {
  await apiClient.delete(`/registrations/${id}`);
}

/** Digital Passport for the Pre-Race Inspection panel (from /horses/{id} + pedigree). */
export async function fetchHorsePassport(horseId: string): Promise<HorsePassport> {
  type TrainerLike = string | { name?: string | null } | null | undefined;
  type HorseLike = { name?: string; microchipNo?: string | null; dateOfBirth?: string | null; gender?: string | null; ownerName?: string | null; trainerName?: TrainerLike };
  const [horse, pedigree] = await Promise.all([
    apiClient
      .get<{ data: HorseLike }>(`/horses/${horseId}`)
      .then((r) => r.data.data)
      .catch(() => ({}) as HorseLike),
    apiClient
      .get<{ data: { trainerName?: TrainerLike; trainer?: TrainerLike } }>(`/horses/${horseId}/pedigree`)
      .then((r) => r.data.data)
      .catch(() => ({}) as { trainerName?: TrainerLike; trainer?: TrainerLike }),
  ]);
  /** Pedigree may return trainer as a string OR an object {name, licenseNo}. */
  const trainerName = (t: TrainerLike): string | null =>
    typeof t === 'string' ? t : (t?.name ?? null);
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob ? Math.max(0, new Date().getUTCFullYear() - dob.getUTCFullYear()) : null;
  const g = (horse?.gender ?? '').toUpperCase();
  const genderWord =
    g === 'MALE' ? 'Colt' : g === 'FEMALE' ? 'Filly' : g === 'GELDING' ? 'Gelding' : g ? humanize(g) : '—';
  return {
    horseId,
    name: horse?.name ?? '—',
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    trainer: trainerName(pedigree?.trainer) ?? trainerName(pedigree?.trainerName) ?? trainerName(horse?.trainerName) ?? null,
    owner: horse?.ownerName ?? null,
  };
}

/** Assemble the Horse Verification panel from /horses/{id} (+pedigree, +medical-status). */
export async function fetchHorseVerification(horseId: string): Promise<HorseVerification> {
  type HorseLike = {
    fullName?: string;
    name?: string;
    breed?: string | null;
    microchipNo?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    fitnessCertified?: boolean | null;
    passportScanStatus?: string | null;
  };
  const [horse, pedigree, medical] = await Promise.all([
    apiClient
      .get<{ data: HorseLike }>(`/horses/${horseId}`)
      .then((r) => r.data.data)
      .catch(() => ({}) as HorseLike),
    apiClient
      .get<{ data: { sireName?: string | null; damName?: string | null } }>(`/horses/${horseId}/pedigree`)
      .then((r) => r.data.data)
      .catch(() => ({}) as { sireName?: string | null; damName?: string | null }),
    apiClient
      .get<{ data: { healthStatus?: string | null; vaccinationsUpToDate?: boolean | null } }>(`/horses/${horseId}/medical-status`)
      .then((r) => r.data.data)
      .catch(() => ({}) as { healthStatus?: string | null; vaccinationsUpToDate?: boolean | null }),
  ]);
  const dob = horse?.dateOfBirth ? new Date(horse.dateOfBirth) : null;
  const ageYears = dob ? Math.max(0, new Date().getUTCFullYear() - dob.getUTCFullYear()) : null;
  const g = (horse?.gender ?? '').toUpperCase();
  const genderWord =
    g === 'MALE' ? 'Stallion' : g === 'FEMALE' ? 'Mare' : g === 'GELDING' ? 'Gelding' : g ? humanize(g) : '—';
  return {
    horseId,
    name: horse?.name ?? horse?.fullName ?? '—',
    microchipNo: horse?.microchipNo ?? null,
    ageYears,
    genderWord,
    breed: horse?.breed ?? null,
    sireName: pedigree?.sireName ?? null,
    damName: pedigree?.damName ?? null,
    vaccinationsUpToDate: medical?.vaccinationsUpToDate ?? null,
    fitnessCertified: horse?.fitnessCertified ?? null,
    passportScanStatus: horse?.passportScanStatus ?? null,
    healthStatus: medical?.healthStatus ?? null,
  };
}

// ---------- Referee — Applicant onboarding (Registration Approval) ----------
// NOTE: SPEC-ONLY endpoints (docs/be-referee-onboarding-contracts-todo.md). They 404 until the BE
// ships them; the onboarding hooks use retry:false so the UI falls to empty/error states quickly.
export interface ApplicationQuery {
  q?: string;
  status?: string;
  requestedRole?: string;
  page?: number;
  size?: number;
}

export async function fetchApplications(query: ApplicationQuery): Promise<{
  rows: ApplicationSummary[];
  totalPages: number;
  page: number;
}> {
  const { data } = await apiClient.get<{
    data: ApplicationSummary[] | { content?: ApplicationSummary[]; totalPages?: number; number?: number };
  }>('/referee/applications', { params: { size: 20, ...query } });
  const d = data.data;
  if (Array.isArray(d)) return { rows: d, totalPages: 1, page: 0 };
  return { rows: d?.content ?? [], totalPages: d?.totalPages ?? 1, page: d?.number ?? 0 };
}

export async function fetchApplicationStats(): Promise<ApplicationStats> {
  const { data } = await apiClient.get<{ data: ApplicationStats }>('/referee/applications/stats');
  return data.data;
}

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  const { data } = await apiClient.get<{ data: ApplicationDetail }>(`/referee/applications/${id}`);
  return data.data;
}

export async function approveApplication(id: string): Promise<void> {
  await apiClient.patch(`/referee/applications/${id}/approve`);
}

export async function rejectApplication(id: string, reason: string): Promise<void> {
  await apiClient.patch(`/referee/applications/${id}/reject`, { reason });
}

export async function requestApplicationInfo(id: string, note: string): Promise<void> {
  await apiClient.patch(`/referee/applications/${id}/request-info`, { note });
}
