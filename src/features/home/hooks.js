import { useQuery } from "@tanstack/react-query";
import {
  fetchFeaturedHorse,
  fetchFeaturedRace,
  fetchGlobalLeaderboard,
  fetchMarketLeaders,
} from "./api";

export function useFeaturedRace() {
  return useQuery({
    queryKey: ["home", "featured-race"],
    queryFn: fetchFeaturedRace,
  });
}

export function useMarketLeaders(raceId) {
  return useQuery({
    queryKey: ["home", "market-leaders", raceId],
    queryFn: () => fetchMarketLeaders(raceId),
    enabled: !!raceId,
  });
}

export function useFeaturedHorse() {
  return useQuery({
    queryKey: ["home", "featured-horse"],
    queryFn: fetchFeaturedHorse,
  });
}

export function useGlobalLeaderboard() {
  return useQuery({
    queryKey: ["home", "global-leaderboard"],
    queryFn: fetchGlobalLeaderboard,
  });
}
