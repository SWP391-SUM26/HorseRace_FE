import { apiClient } from "@/common/lib/apiClient";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function mapTournament(t) {
  return {
    tournamentId: t.tournamentId,
    name: t.name,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    location: t.location,
    description: t.description,
    totalPurse: t.totalPurse,
    registeredEntriesCount: t.registeredEntriesCount ?? t.registeredEntries ?? null,
    entryCap: t.entryCap,
    circuitTier: t.circuitTier,
    imageUrl: t.imageUrl ?? null
  };
}
async function fetchTournaments() {
  const { data } = await apiClient.get("/tournaments", {
    params: { size: 100 }
  });
  return toArray(data.data).map(mapTournament);
}
async function fetchTournament(id) {
  const { data } = await apiClient.get(`/tournaments/${id}`);
  return mapTournament(data.data);
}
async function fetchTournamentRaces(tournamentId) {
  const { data } = await apiClient.get("/races", {
    params: { tournamentId, size: 100, sortBy: "scheduledStartAt", sortDir: "asc" }
  });
  return toArray(data.data).map((r) => ({
    raceId: r.raceId,
    raceCode: r.raceCode,
    name: r.name ?? r.raceCode,
    scheduledStartAt: r.scheduledStartAt,
    status: r.status,
    entriesCount: r.entriesCount
  }));
}
async function fetchTournamentEntries(tournamentId) {
  const { data } = await apiClient.get("/registrations", {
    params: { tournamentId, size: 100 }
  });
  return toArray(data.data).filter((r) => r.status !== "WITHDRAWN" && r.status !== "REJECTED" && r.status !== "REMOVED").map((r) => ({ registrationId: r.registrationId, horseName: r.horseName, ownerName: r.ownerName, status: r.status }));
}
export {
  fetchTournament,
  fetchTournamentEntries,
  fetchTournamentRaces,
  fetchTournaments
};
