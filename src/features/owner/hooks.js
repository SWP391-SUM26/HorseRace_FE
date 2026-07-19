import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRaceEntries, fetchHorseMedical } from "@/features/admin/api";
import {
  confirmParticipation,
  fetchHorseDocuments,
  fetchHorseStandings,
  fetchOwnerDocuments,
  fetchOwnerOverview,
  fetchOwnerRaceRegistrations,
  uploadHorseDocument,
  uploadOwnerDocument,
} from "./api";

export function useOwnerOverview() {
  return useQuery({
    queryKey: ["owner", "overview"],
    queryFn: fetchOwnerOverview,
  });
}

// ---------- Documents (CN2) ----------
export function useOwnerDocuments() {
  return useQuery({
    queryKey: ["owner", "documents", "owner"],
    queryFn: fetchOwnerDocuments,
  });
}

export function useHorseDocuments(horseId) {
  return useQuery({
    queryKey: ["owner", "documents", "horse", horseId],
    queryFn: () => fetchHorseDocuments(horseId),
    enabled: !!horseId,
  });
}

export function useUploadOwnerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadOwnerDocument(file),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["owner", "documents", "owner"] }),
  });
}

export function useUploadHorseDocument(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadHorseDocument(horseId, file),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["owner", "documents", "horse", horseId],
      }),
  });
}

// ---------- Confirm participation (FR-10) ----------
export function useConfirmRaceEntries(raceId) {
  return useQuery({
    queryKey: ["owner", "confirm", "entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId,
  });
}

export function useConfirmHorseMedical(horseId) {
  return useQuery({
    queryKey: ["owner", "confirm", "medical", horseId],
    queryFn: () => fetchHorseMedical(horseId),
    enabled: !!horseId,
  });
}

export function useOwnerRaceRegistrations(ownerUserId, raceId) {
  return useQuery({
    queryKey: ["owner", "confirm", "registrations", ownerUserId, raceId],
    // ownerUserId is REQUIRED for owner-scoping (see api note) — hook stays
    // disabled until we have it.
    queryFn: () => fetchOwnerRaceRegistrations({ ownerUserId, raceId }),
    enabled: !!ownerUserId && !!raceId,
  });
}

export function useConfirmParticipation(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => confirmParticipation({ raceId, entryId }),
    onSuccess: () => {
      // the entries query carries entry.status, which drives the "already
      // confirmed" state
      qc.invalidateQueries({
        queryKey: ["owner", "confirm", "entries", raceId],
      });
      qc.invalidateQueries({ queryKey: ["races", "details"] });
    },
  });
}

export function useHorseStandings(limit = 10) {
  return useQuery({
    queryKey: ["standings", "horses", limit],
    queryFn: () => fetchHorseStandings(limit),
  });
}
