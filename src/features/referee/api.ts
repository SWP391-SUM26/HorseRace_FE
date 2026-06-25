import { apiClient } from '@/common/lib/apiClient';
import type {
  CertifyResultsRequest,
  CertifyResultsResponse,
  CreateViolationRequest,
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
  ResultRow,
  RulingRequest,
  SubmitAllResponse,
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

// ---------- Races (shared read endpoints) ----------
export async function fetchRefereeRaces(): Promise<RefereeRace[]> {
  const { data } = await apiClient.get<{ data: RefereeRace[] | { content?: RefereeRace[] } }>(
    '/races',
    { params: { size: 100, sortBy: 'scheduledStartAt', sortDir: 'desc' } },
  );
  return toArray(data.data).map((r) => ({
    raceId: r.raceId,
    raceCode: r.raceCode ?? null,
    name: r.name,
    scheduledStartAt: r.scheduledStartAt ?? null,
    status: r.status,
    trackCondition: r.trackCondition ?? null,
  }));
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

// ---------- Results ----------
export async function fetchResults(raceId: string): Promise<RaceResults | null> {
  const { data } = await apiClient.get<{ data: RaceResults | null }>(`/races/${raceId}/results`);
  return data.data;
}

export async function recordResults(
  raceId: string,
  results: { entryId: string; finishPosition?: number; finishTimeMs?: number; lengthsBehind?: number; score?: number }[],
): Promise<ResultRow[]> {
  const { data } = await apiClient.post<{ data: ResultRow[] }>(`/races/${raceId}/results`, {
    results,
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
