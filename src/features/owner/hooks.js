import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRaceEntries, fetchHorseMedical } from "@/features/admin/api";
import {
  fetchHorseDocuments,
  fetchOwnerOverview,
  fetchOwnerDocuments,
  fetchOwnerRaceRegistrations,
  uploadHorseDocument,
  uploadOwnerDocument
} from "./api";
function useOwnerOverview() {
  return useQuery({
    queryKey: ["owner", "overview"],
    queryFn: fetchOwnerOverview
  });
}
function useOwnerDocuments() {
  return useQuery({
    queryKey: ["owner", "documents", "owner"],
    queryFn: fetchOwnerDocuments
  });
}
function useHorseDocuments(horseId) {
  return useQuery({
    queryKey: ["owner", "documents", "horse", horseId],
    queryFn: () => fetchHorseDocuments(horseId),
    enabled: !!horseId
  });
}
function useUploadOwnerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadOwnerDocument(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner", "documents", "owner"] })
  });
}
function useUploadHorseDocument(horseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadHorseDocument(horseId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner", "documents", "horse", horseId] })
  });
}
function useConfirmRaceEntries(raceId) {
  return useQuery({
    queryKey: ["owner", "confirm", "entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId
  });
}
function useConfirmHorseMedical(horseId) {
  return useQuery({
    queryKey: ["owner", "confirm", "medical", horseId],
    queryFn: () => fetchHorseMedical(horseId),
    enabled: !!horseId
  });
}
function useOwnerRaceRegistrations(ownerUserId, raceId) {
  return useQuery({
    queryKey: ["owner", "confirm", "registrations", ownerUserId, raceId],
    // ownerUserId is REQUIRED for owner-scoping (see api note) — hook stays disabled until we have it.
    queryFn: () => fetchOwnerRaceRegistrations({ ownerUserId, raceId }),
    enabled: !!ownerUserId && !!raceId
  });
}
export {
  useHorseDocuments,
  useConfirmHorseMedical,
  useConfirmRaceEntries,
  useOwnerOverview,
  useOwnerDocuments,
  useOwnerRaceRegistrations,
  useUploadHorseDocument,
  useUploadOwnerDocument
};
