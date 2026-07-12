import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyRegistrations,
  registerForTournament,
  withdrawRegistration,
  fetchOpenTournaments,
  fetchOpenRaces,
  fetchOwnerHorseOptions,
  uploadRegistrationAttachment,
  fetchRegistrationAttachments
} from "./api";
const KEY = ["registrations"];
function useMyRegistrations(ownerUserId) {
  return useQuery({
    queryKey: [...KEY, ownerUserId],
    queryFn: () => fetchMyRegistrations(ownerUserId),
    enabled: !!ownerUserId
  });
}
function useOpenTournaments() {
  return useQuery({ queryKey: ["tournaments", "open"], queryFn: fetchOpenTournaments });
}
function useOpenRaces(tournamentId) {
  return useQuery({
    queryKey: ["races", "open", tournamentId],
    queryFn: () => fetchOpenRaces(tournamentId),
    enabled: !!tournamentId
  });
}
function useOwnerHorseOptions() {
  return useQuery({ queryKey: ["owner", "horse-options"], queryFn: fetchOwnerHorseOptions });
}
function useRegisterForTournament() {
  const qc = useQueryClient();
  return useMutation({
    // Create the registration, then attach the horse's dossier files to it.
    mutationFn: async (v) => {
      const registrationId = await registerForTournament(v.tournamentId, v.horseId, v.raceId);
      for (const file of v.files ?? []) {
        await uploadRegistrationAttachment(registrationId, file);
      }
      return registrationId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
  });
}
function useRegistrationAttachments(registrationId) {
  return useQuery({
    queryKey: ["registrations", "attachments", registrationId],
    queryFn: () => fetchRegistrationAttachments(registrationId),
    enabled: !!registrationId
  });
}
function useWithdrawRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => withdrawRegistration(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY })
  });
}
export {
  useMyRegistrations,
  useOpenRaces,
  useOpenTournaments,
  useOwnerHorseOptions,
  useRegisterForTournament,
  useRegistrationAttachments,
  useWithdrawRegistration
};
