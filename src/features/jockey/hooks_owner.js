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
} from "./api_owner";
function useJockeys() {
  return useQuery({
    queryKey: ["jockeys", "market"],
    queryFn: fetchJockeys
  });
}
function useUnassignedEntries() {
  return useQuery({
    queryKey: ["jockeys", "unassigned-entries"],
    queryFn: fetchUnassignedEntries
  });
}
function useJockeySuggestions(raceId, horseId) {
  return useQuery({
    queryKey: ["jockeys", "suggestions", raceId, horseId],
    queryFn: () => fetchJockeySuggestions(raceId, horseId),
    enabled: !!raceId && !!horseId
  });
}
function useRaceDetail(raceId) {
  return useQuery({
    queryKey: ["jockeys", "race-detail", raceId],
    queryFn: () => fetchRaceDetail(raceId),
    enabled: !!raceId
  });
}
function useEntryId(raceId, horseId) {
  return useQuery({
    queryKey: ["races", raceId, "entry-of", horseId],
    queryFn: () => resolveEntryId(raceId, horseId),
    enabled: !!raceId && !!horseId
  });
}
function useMyInvitations() {
  return useQuery({ queryKey: ["invitations"], queryFn: fetchMyInvitations });
}
function useSendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => sendInvitation(v.entryId, v.jockeyUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] })
  });
}
function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invitations"] })
  });
}
export {
  useCancelInvitation,
  useEntryId,
  useJockeySuggestions,
  useJockeys,
  useMyInvitations,
  useRaceDetail,
  useSendInvitation,
  useUnassignedEntries
};
