import { apiClient } from '@/common/lib/apiClient';
import type { AttachmentResponse, OwnerOverview, HorseSummary, RaceSummary, OverviewKpis } from './types';

/** Raw shape returned by GET /api/v1/owner/overview. */
interface RawOverview {
  kpis: OverviewKpis;
  horses: { horseId: string; registrationCode: string; name: string; status: string; earnings: number }[];
  upcomingRaces: { raceId: string; name: string; venue: string; date: string; yourHorse: string; entryStatus: string }[];
}

/** "ACTIVE" -> "Active", "GRADE_1" -> "Grade 1". */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mapHorse(h: RawOverview['horses'][number]): HorseSummary {
  return {
    id: h.horseId,
    registrationId: h.registrationCode,
    name: h.name,
    status: titleCase(h.status),
    earnings: h.earnings,
  };
}

function mapRace(r: RawOverview['upcomingRaces'][number]): RaceSummary {
  return {
    id: r.raceId,
    name: r.name,
    course: r.venue,
    date: r.date,
    yourHorse: r.yourHorse,
    entryStatus: titleCase(r.entryStatus),
  };
}

export async function fetchOwnerOverview(): Promise<OwnerOverview> {
  const { data } = await apiClient.get<{ data: RawOverview }>('/owner/overview');
  const raw = data.data;
  // Collapse exact-duplicate upcoming-race rows (same race + same horse).
  const seen = new Set<string>();
  const upcomingRaces = raw.upcomingRaces
    .map(mapRace)
    .filter((r) => {
      const key = `${r.id}|${r.yourHorse}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return {
    kpis: raw.kpis,
    horses: raw.horses.map(mapHorse),
    upcomingRaces,
  };
}

// ---------- Owner / horse documents (CN2 document review) ----------
/** Upload a document scoped to the signed-in owner (auto-scoped by the BE). */
export async function uploadOwnerDocument(file: File): Promise<AttachmentResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('ownerType', 'OWNER');
  const { data } = await apiClient.post<{ data: AttachmentResponse }>('/owner/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

/** Upload a document for one of the owner's horses. */
export async function uploadHorseDocument(horseId: string, file: File): Promise<AttachmentResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('ownerType', 'HORSE');
  form.append('horseId', horseId);
  const { data } = await apiClient.post<{ data: AttachmentResponse }>('/owner/documents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

/** List the owner's own documents. */
export async function fetchOwnerDocuments(): Promise<AttachmentResponse[]> {
  // Owner/horse docs are RESTRICTED — listed via the ownership-checked owner endpoint, not /attachments.
  const { data } = await apiClient.get<{ data: AttachmentResponse[] | null }>('/owner/documents');
  return data.data ?? [];
}

/** List the documents attached to one of the owner's horses (ownership-checked). */
export async function fetchHorseDocuments(horseId: string): Promise<AttachmentResponse[]> {
  const { data } = await apiClient.get<{ data: AttachmentResponse[] | null }>(`/owner/documents/horse/${horseId}`);
  return data.data ?? [];
}

// ---------- Confirm participation (FR-10) — readiness for the owner's race entry ----------
/** One of the owner's registrations for a race (subset used by the readiness view). */
export interface OwnerRegistration {
  registrationId: string;
  status: string | null;
  horseId: string | null;
  horseName: string | null;
  raceId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
/**
 * GET /registrations scoped to ONE owner + race.
 * ⚠️ SECURITY: this endpoint has NO server-side owner scoping (client-supplied `ownerUserId`,
 * no @PreAuthorize). We MUST pass the caller's own `ownerUserId` on every call, otherwise the
 * response would surface other owners' registrations (data-exposure). Never call it unscoped.
 */
export async function fetchOwnerRaceRegistrations(
  params: { ownerUserId: string; raceId: string },
): Promise<OwnerRegistration[]> {
  const { data } = await apiClient.get<{ data: OwnerRegistration[] | { content?: OwnerRegistration[] } }>(
    '/registrations',
    { params: { ownerUserId: params.ownerUserId, raceId: params.raceId, size: 100 } },
  );
  const d = data.data;
  return Array.isArray(d) ? d : (d?.content ?? []);
}
