import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
async function fetchRaceCalendar() {
  const { data } = await apiClient.get("/races", {
    params: { size: 200, sortBy: "scheduledStartAt", sortDir: "asc" }
  });
  return toArray(data.data).map((r) => ({
    raceId: r.raceId,
    raceCode: r.raceCode,
    name: r.name ?? r.raceCode,
    tournamentName: r.tournamentName,
    tournamentImageUrl: r.tournamentImageUrl ?? null,
    venue: r.venueName ?? r.venue,
    scheduledStartAt: r.scheduledStartAt,
    distanceMeter: r.distanceMeter,
    raceType: r.raceType,
    status: r.status,
    entriesCount: r.entriesCount,
    maxParticipants: r.maxParticipants,
    totalPurse: r.totalPurse
  }));
}
async function fetchOwnerRaceIds() {
  try {
    const { data: data2 } = await apiClient.get("/owner/races");
    if (Array.isArray(data2.data)) return data2.data;
  } catch {
  }
  const { data } = await apiClient.get("/owner/overview");
  return (data.data?.upcomingRaces ?? []).map((r) => r.raceId).filter(Boolean);
}
async function fetchOwnerRaceReport() {
  const { data } = await apiClient.get(
    "/owner/race-report"
  );
  const d = data.data;
  return Array.isArray(d) ? d : d?.content ?? [];
}
async function fetchRaceResultSheet(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/results`);
  return data.data ?? null;
}
async function fetchRaceReportViolations(raceId) {
  const { data } = await apiClient.get(
    `/races/${raceId}/violations`
  );
  return Array.isArray(data.data) ? data.data : data.data?.content ?? [];
}
async function certifyRaceResults(raceId, stewardsReport) {
  await apiClient.patch(`/races/${raceId}/results/certify`, {
    acknowledgeInquiriesResolved: true,
    stewardsReport: stewardsReport?.trim() || void 0
  });
}
async function fetchRefereeRaceIds() {
  const { data } = await apiClient.get("/staffing/my-races");
  return data.data ?? [];
}
export {
  certifyRaceResults,
  fetchOwnerRaceIds,
  fetchOwnerRaceReport,
  fetchRaceCalendar,
  fetchRaceReportViolations,
  fetchRaceResultSheet,
  fetchRefereeRaceIds
};
