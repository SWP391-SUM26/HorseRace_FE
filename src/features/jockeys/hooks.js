import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvitation,
  fetchJockeys,
  fetchJockeySuggestions,
  fetchMyInvitations,
  fetchRaceDetail,
  fetchUnassignedEntries,
  resolveEntryId,
  sendInvitation,
} from "./api";

export function useJockeys() {
  return useQuery({
    queryKey: ["jockeys", "market"],
    queryFn: fetchJockeys,
  });
}

export function useUnassignedEntries() {
  return useQuery({
    queryKey: ["jockeys", "unassigned-entries"],
    queryFn: fetchUnassignedEntries,
  });
}

export function useJockeySuggestions(raceId, horseId) {
  return useQuery({
    queryKey: ["jockeys", "suggestions", raceId, horseId],
    queryFn: () => fetchJockeySuggestions(raceId, horseId),
    enabled: !!raceId && !!horseId,
  });
}

export function useRaceDetail(raceId) {
  return useQuery({
    queryKey: ["jockeys", "race-detail", raceId],
    queryFn: () => fetchRaceDetail(raceId),
    enabled: !!raceId,
  });
}

export function useEntryId(raceId, horseId) {
  return useQuery({
    queryKey: ["races", raceId, "entry-of", horseId],
    queryFn: () => resolveEntryId(raceId, horseId),
    enabled: !!raceId && !!horseId,
  });
}

export function useMyInvitations(ownerUserId) {
  return useQuery({
    queryKey: ["invitations", ownerUserId],
    queryFn: () => fetchMyInvitations(ownerUserId),
    enabled: !!ownerUserId,
  });
}

/** Refresh invitations, the unassigned-horse rail, and the suggestion lists (eligibility changes). */
function invalidateInviteState(qc) {
  qc.invalidateQueries({ queryKey: ["invitations"] });
  qc.invalidateQueries({ queryKey: ["jockeys", "unassigned-entries"] });
  qc.invalidateQueries({ queryKey: ["jockeys", "suggestions"] });
  // Hiring escrows the fee and cancelling releases it, so the balance on screen is stale the
  // moment either lands.
  qc.invalidateQueries({ queryKey: ["wallet"] });
}

export function useSendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => sendInvitation(v.entryId, v.jockeyUserId, v.agreedBaseFee),
    onSuccess: () => invalidateInviteState(qc),
  });
}

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelInvitation(id),
    onSuccess: () => invalidateInviteState(qc),
  });
}

/** Edit an invitation = cancel the current one, then invite a different jockey to the same entry. */
export function useReassignInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v) => {
      await cancelInvitation(v.assignmentId);
      await sendInvitation(v.entryId, v.jockeyUserId, v.agreedBaseFee);
    },
    onSuccess: () => invalidateInviteState(qc),
  });
}
