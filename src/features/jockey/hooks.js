import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  fetchInvitationInsights,
  fetchJockeyDetail,
  fetchJockeyInvitations,
  fetchJockeyProfile,
  fetchJockeyStats,
  fetchLeaderboard,
  fetchMyRides,
  fetchRaceEntries,
  fetchRideIntelligence,
  rejectInvitation,
  updateMyJockeyProfile,
  withdrawInvitation
} from "./api";
const INVITATIONS_KEY = ["jockey", "invitations"];
function useJockeyProfile(id) {
  return useQuery({
    queryKey: ["jockey", "profile", id],
    queryFn: () => fetchJockeyProfile(id),
    enabled: !!id
  });
}
function useJockeyInvitations(jockeyUserId, status) {
  return useQuery({
    queryKey: ["jockey", "invitations", jockeyUserId, status],
    queryFn: () => fetchJockeyInvitations(jockeyUserId, status),
    enabled: !!jockeyUserId
  });
}
function useJockeyStats(enabled = true) {
  return useQuery({
    queryKey: ["jockey", "stats"],
    queryFn: fetchJockeyStats,
    enabled
  });
}
function useInvitationInsights(enabled = true) {
  return useQuery({
    queryKey: ["jockey", "invitation-insights"],
    queryFn: fetchInvitationInsights,
    enabled
  });
}
function useMyRides(when, enabled = true) {
  return useQuery({
    queryKey: ["jockey", "rides", when],
    queryFn: () => fetchMyRides(when),
    enabled
  });
}
function useLeaderboard() {
  return useQuery({
    queryKey: ["jockey", "leaderboard"],
    queryFn: () => fetchLeaderboard()
  });
}
function useRaceEntries(raceId) {
  return useQuery({
    queryKey: ["jockey", "race-entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId,
    staleTime: 5 * 6e4
  });
}
function useRideIntelligence(horseId) {
  return useQuery({
    queryKey: ["horses", "ride-intelligence", horseId],
    queryFn: () => fetchRideIntelligence(horseId),
    enabled: !!horseId,
    staleTime: 5 * 6e4
  });
}
function useJockeyDetail(id) {
  return useQuery({
    queryKey: ["jockey", "detail", id],
    queryFn: () => fetchJockeyDetail(id),
    enabled: !!id
  });
}
function useUpdateMyJockeyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => updateMyJockeyProfile(body),
    onSuccess: (detail) => {
      qc.setQueryData(["jockey", "detail", detail.id], detail);
      qc.invalidateQueries({ queryKey: ["jockey", "profile"] });
      qc.invalidateQueries({ queryKey: ["jockey", "leaderboard"] });
    }
  });
}
function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "rides"] });
      qc.invalidateQueries({ queryKey: ["jockey", "stats"] });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    }
  });
}
function useRejectInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    }
  });
}
function useWithdrawInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => withdrawInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "rides"] });
      qc.invalidateQueries({ queryKey: ["jockey", "stats"] });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    }
  });
}
import {
  fetchJockeySuggestions,
  searchJockeys,
  fetchJockeysPage,
  filterJockeys
} from "./api";
function useJockeySuggestions(raceId) {
  return useQuery({
    queryKey: ["jockey", "suggestions", raceId],
    queryFn: () => fetchJockeySuggestions(raceId),
    enabled: !!raceId
  });
}
function useSearchJockeys(query) {
  return useQuery({
    queryKey: ["jockey", "search", query],
    queryFn: () => searchJockeys(query),
    enabled: !!query
  });
}
function useJockeysPage(params) {
  return useQuery({
    queryKey: ["jockey", "page", params],
    queryFn: () => fetchJockeysPage(params)
  });
}
function useFilterJockeys(filter) {
  return useQuery({
    queryKey: ["jockey", "filter", filter],
    queryFn: () => filterJockeys(filter)
  });
}
export {
  useAcceptInvitation,
  useFilterJockeys,
  useInvitationInsights,
  useJockeyDetail,
  useJockeyInvitations,
  useJockeyProfile,
  useJockeyStats,
  useJockeySuggestions,
  useJockeysPage,
  useLeaderboard,
  useMyRides,
  useRaceEntries,
  useRejectInvitation,
  useRideIntelligence,
  useSearchJockeys,
  useUpdateMyJockeyProfile,
  useWithdrawInvitation
};
