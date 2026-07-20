import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRaceEntries, fetchHorseMedical } from '@/features/admin/api';
import {
  fetchOwnerOverview,
  fetchOwnerDocuments,
  fetchHorseDocuments,
  fetchOwnerRaceRegistrations,
  uploadOwnerDocument,
  uploadHorseDocument,
} from './api';

export function useOwnerOverview() {
  return useQuery({
    queryKey: ['owner', 'overview'],
    queryFn: fetchOwnerOverview,
  });
}

// ---------- Documents (CN2) ----------
export function useOwnerDocuments() {
  return useQuery({
    queryKey: ['owner', 'documents', 'owner'],
    queryFn: fetchOwnerDocuments,
  });
}

export function useHorseDocuments(horseId: string | null) {
  return useQuery({
    queryKey: ['owner', 'documents', 'horse', horseId],
    queryFn: () => fetchHorseDocuments(horseId!),
    enabled: !!horseId,
  });
}

export function useUploadOwnerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadOwnerDocument(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner', 'documents', 'owner'] }),
  });
}

export function useUploadHorseDocument(horseId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadHorseDocument(horseId!, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner', 'documents', 'horse', horseId] }),
  });
}

// ---------- Confirm participation (FR-10) ----------
export function useConfirmRaceEntries(raceId: string | null) {
  return useQuery({
    queryKey: ['owner', 'confirm', 'entries', raceId],
    queryFn: () => fetchRaceEntries(raceId!),
    enabled: !!raceId,
  });
}
export function useConfirmHorseMedical(horseId: string | null) {
  return useQuery({
    queryKey: ['owner', 'confirm', 'medical', horseId],
    queryFn: () => fetchHorseMedical(horseId!),
    enabled: !!horseId,
  });
}
export function useOwnerRaceRegistrations(ownerUserId: string | null, raceId: string | null) {
  return useQuery({
    queryKey: ['owner', 'confirm', 'registrations', ownerUserId, raceId],
    // ownerUserId is REQUIRED for owner-scoping (see api note) — hook stays disabled until we have it.
    queryFn: () => fetchOwnerRaceRegistrations({ ownerUserId: ownerUserId!, raceId: raceId! }),
    enabled: !!ownerUserId && !!raceId,
  });
}
