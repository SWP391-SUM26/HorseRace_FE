import { apiClient } from "@/common/lib/apiClient";

/**
 * Unwrap a list payload that may be a bare array or a Spring Page object.
 * Tolerates the several envelope keys the gateway has used over time.
 */
function toArray(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const keys = ["content", "items", "records", "rows", "data", "list"];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (data.data && typeof data.data === "object") return toArray(data.data);
  return [];
}

/** A row in the Race Calendar — all real fields from GET /races. */
export async function fetchRaceCalendar() {
  const { data } = await apiClient.get("/races", {
    params: { size: 200, sortBy: "scheduledStartAt", sortDir: "asc" },
  });

  return toArray(data?.data).map((race) => ({
    raceId: race.raceId,
    raceCode: race.raceCode,
    name: race.name ?? race.raceCode,
    tournamentName: race.tournamentName,
    tournamentImageUrl: race.tournamentImageUrl ?? null,
    venue: race.venueName ?? race.venue,
    scheduledStartAt: race.scheduledStartAt,
    distanceMeter: race.distanceMeter,
    raceType: race.raceType,
    status: race.status,
    entriesCount: race.entriesCount,
    maxParticipants: race.maxParticipants,
    totalPurse: race.totalPurse,
  }));
}

/**
 * IDs of every race the current owner's horses are entered into (any status).
 * Prefers the dedicated GET /owner/races; if that endpoint isn't deployed yet,
 * falls back to the owner overview's upcoming races so the calendar still
 * filters.
 */
export async function fetchOwnerRaceIds() {
  try {
    const { data } = await apiClient.get("/owner/races");
    if (Array.isArray(data?.data)) return data.data;
  } catch {
    // endpoint not available yet — fall through to the overview-based fallback
  }

  const { data } = await apiClient.get("/owner/overview");
  return (data?.data?.upcomingRaces ?? [])
    .map((race) => race.raceId)
    .filter(Boolean);
}

// ── Owner per-race report (registered vs. participated) ──
export async function fetchOwnerRaceReport() {
  const { data } = await apiClient.get("/owner/race-report");
  return toArray(data?.data);
}

// ── Race Report: results sheet + violations ──
export async function fetchRaceResultSheet(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data?.data ?? null;
}

export async function fetchRaceReportViolations(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/violations`);
  return toArray(data?.data);
}

/** Admin-only: certify the race's results as OFFICIAL (publish). */
export async function certifyRaceResults(raceId, stewardsReport) {
  await apiClient.patch(`/races/${raceId}/results/certify`, {
    acknowledgeInquiriesResolved: true,
    stewardsReport: stewardsReport?.trim() || undefined,
  });
}

/**
 * Race IDs the signed-in referee is assigned (by admin) to officiate —
 * scopes referee reports.
 */
export async function fetchRefereeRaceIds() {
  const { data } = await apiClient.get("/staffing/my-races");
  return data?.data ?? [];
}
