// View models for GET /api/v1/owner/overview.

export interface HorseSummary {
  id: string;
  /** Stud-book code, e.g. "HRS0001". */
  registrationId: string;
  name: string;
  /** Title-cased horse status, e.g. "Active", "Retired". */
  status: string;
  earnings: number;
}

export interface RaceSummary {
  id: string;
  name: string;
  /** Venue / course. */
  course: string;
  /** ISO date string. */
  date: string;
  yourHorse: string;
  entryStatus: string;
}

export interface OverviewKpis {
  lifetimeEarnings: number;
  starts: number;
  wins: number;
  top3: number;
  activeHorses: number;
  netProfit: number;
  margin: number | null;
  netProfitTrend: number | null;
  pendingPayouts: number;
  pendingCount: number;
  pendingEtaDays: number | null;
}

export interface OwnerOverview {
  kpis: OverviewKpis;
  horses: HorseSummary[];
  upcomingRaces: RaceSummary[];
}

/** GET/POST /api/v1/attachments (and /owner/documents) — AttachmentResponse. */
export interface AttachmentResponse {
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
