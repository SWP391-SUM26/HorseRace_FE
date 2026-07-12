import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveApplication,
  approveRegistration,
  certifyResults,
  createViolation,
  deleteResult,
  fetchApplication,
  fetchApplications,
  fetchApplicationStats,
  fetchHorsePassport,
  fetchHorseVerification,
  fetchInspections,
  fetchLiveRace,
  fetchMyAssignments,
  fetchMyTournamentInvitations,
  fetchMyRaceAssignments,
  acceptRaceAssignment,
  declineRaceAssignment,
  acceptTournamentInvitation,
  rejectTournamentInvitation,
  fetchEntryReviews,
  acceptEntry,
  rejectEntry,
  fetchRaceViolations,
  fetchRefereeDashboard,
  fetchRefereeRaces,
  fetchRefereeRace,
  fetchRegistrations,
  fetchRegistrationStats,
  fetchResults,
  fetchViolation,
  recordInspection,
  recordResults,
  requestRefereeCode,
  submitReport,
  flagInquiry,
  recordRuling,
  updateViolation,
  deleteViolation,
  fetchRaceEntries,
  rejectApplication,
  rejectRegistration,
  deleteRegistration,
  requestApplicationInfo,
  submitAllInspections
} from "./api";
function useRefereeDashboard(enabled = true) {
  return useQuery({ queryKey: ["referee", "dashboard"], queryFn: fetchRefereeDashboard, enabled });
}
function useRefereeRaces(options = {}) {
  return useQuery({
    queryKey: ["referee", "races"],
    queryFn: fetchRefereeRaces,
    refetchInterval: options.refetchInterval ?? false
  });
}
function useRefereeRaceById(raceId) {
  return useQuery({
    queryKey: ["referee", "race", raceId],
    queryFn: () => fetchRefereeRace(raceId),
    enabled: !!raceId,
    refetchInterval: 1e4
  });
}
function useEntryReviews(raceId) {
  return useQuery({
    queryKey: ["referee", "entry-reviews", raceId],
    queryFn: () => fetchEntryReviews(raceId),
    enabled: !!raceId
  });
}
function useAcceptEntry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => acceptEntry(raceId, entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "entry-reviews", raceId] })
  });
}
function useRejectEntry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, reason }) => rejectEntry(raceId, entryId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "entry-reviews", raceId] })
  });
}
function useInspections(raceId) {
  return useQuery({
    queryKey: ["referee", "inspections", raceId],
    queryFn: () => fetchInspections(raceId),
    enabled: !!raceId
  });
}
function useRecordInspection(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => recordInspection(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "inspections", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    }
  });
}
function useSubmitAllInspections(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitAllInspections(raceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "inspections", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    }
  });
}
function useRaceViolations(raceId) {
  return useQuery({
    queryKey: ["referee", "violations", "race", raceId],
    queryFn: () => fetchRaceViolations(raceId),
    enabled: !!raceId
  });
}
function useViolation(violationId) {
  return useQuery({
    queryKey: ["referee", "violation", violationId],
    queryFn: () => fetchViolation(violationId),
    enabled: !!violationId
  });
}
function useCreateViolation(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => createViolation(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "violations"] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    }
  });
}
function useRecordRuling(violationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => recordRuling(violationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "violation", violationId] });
      qc.invalidateQueries({ queryKey: ["referee", "violations"] });
    }
  });
}
function useUpdateViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => updateViolation(v.violationId, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "violations"] })
  });
}
function useDeleteViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (violationId) => deleteViolation(violationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "violations"] })
  });
}
function useRaceEntries(raceId) {
  return useQuery({
    queryKey: ["referee", "race-entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId
  });
}
function useResults(raceId) {
  return useQuery({
    queryKey: ["referee", "results", raceId],
    queryFn: () => fetchResults(raceId),
    enabled: !!raceId
  });
}
function useRecordResults(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => recordResults(raceId, vars.results),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "results", raceId] })
  });
}
function useRequestRefereeCode(raceId) {
  return useMutation({ mutationFn: () => requestRefereeCode(raceId) });
}
function useSubmitReport(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => submitReport(raceId, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    }
  });
}
function useFlagInquiry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultId) => flagInquiry(raceId, resultId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "results", raceId] })
  });
}
function useDeleteResult(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultId) => deleteResult(raceId, resultId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "results", raceId] })
  });
}
function useMyAssignments() {
  return useQuery({ queryKey: ["referee", "my-assignments"], queryFn: fetchMyAssignments });
}
function useMyTournamentInvitations() {
  return useQuery({ queryKey: ["referee", "tournament-invitations"], queryFn: fetchMyTournamentInvitations });
}
function useAcceptTournamentInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptTournamentInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "tournament-invitations"] })
  });
}
function useRejectTournamentInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectTournamentInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "tournament-invitations"] })
  });
}
function useMyRaceAssignments() {
  return useQuery({ queryKey: ["referee", "race-assignments"], queryFn: fetchMyRaceAssignments });
}
function useAcceptRaceAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptRaceAssignment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "race-assignments"] })
  });
}
function useDeclineRaceAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => declineRaceAssignment(v.id, v.reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "race-assignments"] })
  });
}
function useCertifyResults(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => certifyResults(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    }
  });
}
function useLiveRace(raceId, refetchMs = 5e3) {
  return useQuery({
    queryKey: ["referee", "live", raceId],
    queryFn: () => fetchLiveRace(raceId),
    enabled: !!raceId,
    refetchInterval: refetchMs
  });
}
function useRegistrations(query) {
  return useQuery({
    queryKey: ["referee", "registrations", query],
    queryFn: () => fetchRegistrations(query)
  });
}
function useRegistrationStats() {
  return useQuery({ queryKey: ["referee", "registration-stats"], queryFn: fetchRegistrationStats });
}
function useHorsePassport(horseId) {
  return useQuery({
    queryKey: ["referee", "horse-passport", horseId],
    queryFn: () => fetchHorsePassport(horseId),
    enabled: !!horseId
  });
}
function useHorseVerification(horseId) {
  return useQuery({
    queryKey: ["referee", "horse-verification", horseId],
    queryFn: () => fetchHorseVerification(horseId),
    enabled: !!horseId
  });
}
function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    }
  });
}
function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectRegistration(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    }
  });
}
function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    }
  });
}
function useApplications(query) {
  return useQuery({
    queryKey: ["referee", "applications", query],
    queryFn: () => fetchApplications(query),
    retry: false
  });
}
function useApplicationStats() {
  return useQuery({
    queryKey: ["referee", "application-stats"],
    queryFn: fetchApplicationStats,
    retry: false
  });
}
function useApplication(id) {
  return useQuery({
    queryKey: ["referee", "application", id],
    queryFn: () => fetchApplication(id),
    enabled: !!id,
    retry: false
  });
}
function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application-stats"] });
    }
  });
}
function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectApplication(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application-stats"] });
    }
  });
}
function useRequestApplicationInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => requestApplicationInfo(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application"] });
    }
  });
}
export {
  useAcceptEntry,
  useAcceptRaceAssignment,
  useAcceptTournamentInvitation,
  useApplication,
  useApplicationStats,
  useApplications,
  useApproveApplication,
  useApproveRegistration,
  useCertifyResults,
  useCreateViolation,
  useDeclineRaceAssignment,
  useDeleteRegistration,
  useDeleteResult,
  useDeleteViolation,
  useEntryReviews,
  useFlagInquiry,
  useHorsePassport,
  useHorseVerification,
  useInspections,
  useLiveRace,
  useMyAssignments,
  useMyRaceAssignments,
  useMyTournamentInvitations,
  useRaceEntries,
  useRaceViolations,
  useRecordInspection,
  useRecordResults,
  useRecordRuling,
  useRefereeDashboard,
  useRefereeRaceById,
  useRefereeRaces,
  useRegistrationStats,
  useRegistrations,
  useRejectApplication,
  useRejectEntry,
  useRejectRegistration,
  useRejectTournamentInvitation,
  useRequestApplicationInfo,
  useRequestRefereeCode,
  useResults,
  useSubmitAllInspections,
  useSubmitReport,
  useUpdateViolation,
  useViolation
};
