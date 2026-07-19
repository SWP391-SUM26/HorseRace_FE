import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvitation,
  fetchJockeys,
  fetchJockeySuggestions,
  fetchMyInvitations,
  fetchRaceDetail,
  fetchUnassignedEntries,
  resolveEntryId,
  sendInvitation
} from "./api";

export function useJockeys() {
  return useQuery({ queryKey: ["jockeys", "market"], queryFn: fetchJockeys });
}

export function useUnassignedEntries() {
  return useQuery({
    queryKey: ["jockeys", "unassigned-entries"],
    queryFn: fetchUnassignedEntries
  });
}

export function useJockeySuggestions(raceId, horseId) {
  return useQuery({
    queryKey: ["jockeys", "suggestions", raceId, horseId],
    queryFn: () => fetchJockeySuggestions(raceId, horseId),
    enabled: Boolean(raceId && horseId)
  });
}

export function useRaceDetail(raceId) {
  return useQuery({
    queryKey: ["jockeys", "race-detail", raceId],
    queryFn: () => fetchRaceDetail(raceId),
    enabled: Boolean(raceId)
  });
}

export function useEntryId(raceId, horseId) {
  return useQuery({
    queryKey: ["races", raceId, "entry-of", horseId],
    queryFn: () => resolveEntryId(raceId, horseId),
    enabled: Boolean(raceId && horseId)
  });
}

export function useMyInvitations(ownerUserId) {
  return useQuery({
    queryKey: ["invitations", ownerUserId],
    queryFn: () => fetchMyInvitations(ownerUserId),
    enabled: Boolean(ownerUserId)
  });
}

function invalidateInviteState(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["invitations"] });
  queryClient.invalidateQueries({ queryKey: ["jockeys", "unassigned-entries"] });
  queryClient.invalidateQueries({ queryKey: ["jockeys", "suggestions"] });
}

export function useSendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, jockeyUserId }) => sendInvitation(entryId, jockeyUserId),
    onSuccess: () => invalidateInviteState(queryClient)
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelInvitation(id),
    onSuccess: () => invalidateInviteState(queryClient)
  });
}

export function useReassignInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, entryId, jockeyUserId }) => {
      await cancelInvitation(assignmentId);
      await sendInvitation(entryId, jockeyUserId);
    },
    onSuccess: () => invalidateInviteState(queryClient)
  });
}
