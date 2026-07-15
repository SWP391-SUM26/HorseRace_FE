import { apiClient } from "@/common/lib/apiClient";

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

export async function fetchOwnerRaceIds() {
  try {
    const { data } = await apiClient.get("/owner/races");
    if (Array.isArray(data?.data)) return data.data;
  } catch {
    // Fallback used by V2 when the owner scoped race endpoint is not deployed.
  }

  const { data } = await apiClient.get("/owner/overview");
  return (data?.data?.upcomingRaces ?? []).map((race) => race.raceId).filter(Boolean);
}

export async function fetchOwnerRaceReport() {
  const { data } = await apiClient.get("/owner/race-report");
  return toArray(data?.data);
}

export async function fetchRaceResultSheet(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data?.data ?? null;
}

export async function fetchRaceReportViolations(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/violations`);
  return toArray(data?.data);
}

export async function certifyRaceResults(raceId, stewardsReport) {
  await apiClient.patch(`/races/${raceId}/results/certify`, {
    acknowledgeInquiriesResolved: true,
    stewardsReport: stewardsReport?.trim() || undefined,
  });
}

export async function fetchRefereeRaceIds() {
  const { data } = await apiClient.get("/staffing/my-races");
  return data?.data ?? [];
}
