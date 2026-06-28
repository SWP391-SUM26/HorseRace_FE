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
  acceptTournamentInvitation,
  rejectTournamentInvitation,
  fetchRaceViolations,
  fetchRefereeDashboard,
  fetchRefereeRaces,
  fetchRegistrations,
  fetchRegistrationStats,
  fetchResults,
  fetchViolation,
  recordInspection,
  recordResults,
  recordRuling,
  updateViolation,
  deleteViolation,
  fetchRaceEntries,
  rejectApplication,
  rejectRegistration,
  requestApplicationInfo,
  submitAllInspections
} from "./api";
function useRefereeDashboard(enabled = true) {
  return useQuery({ queryKey: ["referee", "dashboard"], queryFn: fetchRefereeDashboard, enabled });
}
function useRefereeRaces() {
  return useQuery({ queryKey: ["referee", "races"], queryFn: fetchRefereeRaces });
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
    mutationFn: (vars) => recordResults(raceId, vars.results, vars.refCode),
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
import {
  fetchRefereeReports,
  createRefereeReport,
  updateRefereeReport,
  submitRefereeReport,
  recordHorseHealthCheck
} from "./api";
function useRefereeReports(filter) {
  return useQuery({
    queryKey: ["referee", "reports", filter],
    queryFn: () => fetchRefereeReports(filter)
  });
}
function useCreateRefereeReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => createRefereeReport(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "reports"] })
  });
}
function useUpdateRefereeReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => updateRefereeReport(vars.id, vars.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "reports"] })
  });
}
function useSubmitRefereeReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => submitRefereeReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "reports"] })
  });
}
function useRecordHorseHealthCheck(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => recordHorseHealthCheck(horseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referee", "horse-verification", horseId] })
  });
}
export {
  useAcceptTournamentInvitation,
  useApplication,
  useApplicationStats,
  useApplications,
  useApproveApplication,
  useApproveRegistration,
  useCertifyResults,
  useCreateRefereeReport,
  useCreateViolation,
  useDeleteResult,
  useDeleteViolation,
  useHorsePassport,
  useHorseVerification,
  useInspections,
  useLiveRace,
  useMyAssignments,
  useMyTournamentInvitations,
  useRaceEntries,
  useRaceViolations,
  useRecordHorseHealthCheck,
  useRecordInspection,
  useRecordResults,
  useRecordRuling,
  useRefereeDashboard,
  useRefereeRaces,
  useRefereeReports,
  useRegistrationStats,
  useRegistrations,
  useRejectApplication,
  useRejectRegistration,
  useRejectTournamentInvitation,
  useRequestApplicationInfo,
  useResults,
  useSubmitAllInspections,
  useSubmitRefereeReport,
  useUpdateRefereeReport,
  useUpdateViolation,
  useViolation
};
