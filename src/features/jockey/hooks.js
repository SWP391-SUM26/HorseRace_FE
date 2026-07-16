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
  withdrawInvitation,
} from "./api";

const INVITATIONS_KEY = ["jockey", "invitations"];

export function useJockeyProfile(id) {
  return useQuery({
    queryKey: ["jockey", "profile", id],
    queryFn: () => fetchJockeyProfile(id),
    enabled: !!id,
  });
}

export function useJockeyInvitations(jockeyUserId, status) {
  return useQuery({
    queryKey: ["jockey", "invitations", jockeyUserId, status],
    queryFn: () => fetchJockeyInvitations(jockeyUserId, status),
    enabled: !!jockeyUserId,
  });
}

/** REAL — GET /jockeys/me/stats. Gated on auth (token-resolved /me endpoint). */
export function useJockeyStats(enabled = true) {
  return useQuery({
    queryKey: ["jockey", "stats"],
    queryFn: fetchJockeyStats,
    enabled,
  });
}

/** REAL — GET /jockeys/me/invitation-insights. */
export function useInvitationInsights(enabled = true) {
  return useQuery({
    queryKey: ["jockey", "invitation-insights"],
    queryFn: fetchInvitationInsights,
    enabled,
  });
}

/** REAL — GET /assignments/me/rides?when=. */
export function useMyRides(when, enabled = true) {
  return useQuery({
    queryKey: ["jockey", "rides", when],
    queryFn: () => fetchMyRides(when),
    enabled,
  });
}

/** REAL — derived leaderboard from GET /jockeys (no auth needed). */
export function useLeaderboard() {
  return useQuery({
    queryKey: ["jockey", "leaderboard"],
    queryFn: () => fetchLeaderboard(),
  });
}

/** REAL — GET /races/{raceId}/entries (used to resolve a ride's horseId by name). */
export function useRaceEntries(raceId) {
  return useQuery({
    queryKey: ["jockey", "race-entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId,
    staleTime: 5 * 60_000,
  });
}

/** REAL — GET /horses/{id}/ride-intelligence (form profile is slow-changing). */
export function useRideIntelligence(horseId) {
  return useQuery({
    queryKey: ["horses", "ride-intelligence", horseId],
    queryFn: () => fetchRideIntelligence(horseId),
    enabled: !!horseId,
    staleTime: 5 * 60_000,
  });
}

/** REAL — GET /jockeys/{id} full editable profile (seeds the self-edit form). */
export function useJockeyDetail(id) {
  return useQuery({
    queryKey: ["jockey", "detail", id],
    queryFn: () => fetchJockeyDetail(id),
    enabled: !!id,
  });
}

export function useUpdateMyJockeyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => updateMyJockeyProfile(body),
    onSuccess: (detail) => {
      qc.setQueryData(["jockey", "detail", detail.id], detail);
      qc.invalidateQueries({ queryKey: ["jockey", "profile"] });
      qc.invalidateQueries({ queryKey: ["jockey", "leaderboard"] });
    },
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "rides"] });
      qc.invalidateQueries({ queryKey: ["jockey", "stats"] });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    },
  });
}

export function useRejectInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    },
  });
}

/** Jockey withdraws from an ACCEPTED ride (→ CANCELLED). Affects rides + stats. */
export function useWithdrawInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => withdrawInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVITATIONS_KEY });
      qc.invalidateQueries({ queryKey: ["jockey", "rides"] });
      qc.invalidateQueries({ queryKey: ["jockey", "stats"] });
      qc.invalidateQueries({ queryKey: ["jockey", "invitation-insights"] });
    },
  });
}
