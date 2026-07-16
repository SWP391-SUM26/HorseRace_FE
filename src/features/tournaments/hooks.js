import { useQuery } from "@tanstack/react-query";
import {
  fetchTournament,
  fetchTournamentEntries,
  fetchTournamentRaces,
  fetchTournaments
} from "./api";

function useTournaments() {
  return useQuery({
    queryKey: ["owner", "tournaments"],
    queryFn: fetchTournaments
  });
}

function useTournament(id) {
  return useQuery({
    queryKey: ["owner", "tournaments", id],
    queryFn: () => fetchTournament(id),
    enabled: Boolean(id)
  });
}

function useTournamentRaces(tournamentId) {
  return useQuery({
    queryKey: ["owner", "tournaments", tournamentId, "races"],
    queryFn: () => fetchTournamentRaces(tournamentId),
    enabled: Boolean(tournamentId)
  });
}

function useTournamentEntries(tournamentId) {
  return useQuery({
    queryKey: ["owner", "tournaments", tournamentId, "entries"],
    queryFn: () => fetchTournamentEntries(tournamentId),
    enabled: Boolean(tournamentId)
  });
}

export {
  useTournament,
  useTournamentEntries,
  useTournamentRaces,
  useTournaments
};
