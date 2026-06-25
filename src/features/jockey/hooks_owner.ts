import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelInvitation,
  fetchJockeys,
  fetchJockeySuggestions,
  fetchMyInvitations,
  fetchRaceDetail,
  fetchUnassignedEntries,
  resolveEntryId,
  sendInvitation,
} from './api_owner';

export function useJockeys() {
  return useQuery({
    queryKey: ['jockeys', 'market'],
    queryFn: fetchJockeys,
  });
}

export function useUnassignedEntries() {
  return useQuery({
    queryKey: ['jockeys', 'unassigned-entries'],
    queryFn: fetchUnassignedEntries,
  });
}

export function useJockeySuggestions(raceId: string, horseId: string) {
  return useQuery({
    queryKey: ['jockeys', 'suggestions', raceId, horseId],
    queryFn: () => fetchJockeySuggestions(raceId, horseId),
    enabled: !!raceId && !!horseId,
  });
}

export function useRaceDetail(raceId: string) {
  return useQuery({
    queryKey: ['jockeys', 'race-detail', raceId],
    queryFn: () => fetchRaceDetail(raceId),
    enabled: !!raceId,
  });
}

export function useEntryId(raceId: string, horseId: string) {
  return useQuery({
    queryKey: ['races', raceId, 'entry-of', horseId],
    queryFn: () => resolveEntryId(raceId, horseId),
    enabled: !!raceId && !!horseId,
  });
}

export function useMyInvitations() {
  return useQuery({ queryKey: ['invitations'], queryFn: fetchMyInvitations });
}

export function useSendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { entryId: string; jockeyUserId: string }) =>
      sendInvitation(v.entryId, v.jockeyUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useCancelInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  });
}
