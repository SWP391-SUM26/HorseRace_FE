import { useQuery } from "@tanstack/react-query";
import {
  fetchTournament,
  fetchTournamentEntries,
  fetchTournamentRaces,
  fetchTournaments,
} from "./api";

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments", "catalog"],
    queryFn: fetchTournaments,
  });
}
export function useTournament(id) {
  return useQuery({
    queryKey: ["tournaments", "detail", id],
    queryFn: () => fetchTournament(id),
    enabled: !!id,
  });
}
export function useTournamentRaces(id) {
  return useQuery({
    queryKey: ["tournaments", "races", id],
    queryFn: () => fetchTournamentRaces(id),
    enabled: !!id,
  });
}
export function useTournamentEntries(id) {
  return useQuery({
    queryKey: ["tournaments", "entries", id],
    queryFn: () => fetchTournamentEntries(id),
    enabled: !!id,
  });
}
