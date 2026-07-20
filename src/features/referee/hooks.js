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
  submitAllInspections,
} from "./api";

// ---------- Dashboard ----------
export function useRefereeDashboard(enabled = true) {
  return useQuery({
    queryKey: ["referee", "dashboard"],
    queryFn: fetchRefereeDashboard,
    enabled,
  });
}

// ---------- Races picker ----------
/**
 * Races scoped to the signed-in referee's assignments. Pass `refetchInterval` to keep race
 * status fresh while mounted (e.g. the live monitor, so a race leaving RUNNING stops the fast poll).
 */
export function useRefereeRaces(options = {}) {
  return useQuery({
    queryKey: ["referee", "races"],
    queryFn: fetchRefereeRaces,
    refetchInterval: options.refetchInterval ?? false,
  });
}

/** Fetch one race directly — resolves a deep-linked race that falls outside the scoped list's window. */
export function useRefereeRaceById(raceId) {
  return useQuery({
    queryKey: ["referee", "race", raceId],
    queryFn: () => fetchRefereeRace(raceId),
    enabled: !!raceId,
    refetchInterval: 10000,
  });
}

// ---------- Document review (CN2) ----------
export function useEntryReviews(raceId) {
  return useQuery({
    queryKey: ["referee", "entry-reviews", raceId],
    queryFn: () => fetchEntryReviews(raceId),
    enabled: !!raceId,
  });
}

export function useAcceptEntry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId) => acceptEntry(raceId, entryId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "entry-reviews", raceId] }),
  });
}

export function useRejectEntry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, reason }) => rejectEntry(raceId, entryId, reason),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "entry-reviews", raceId] }),
  });
}

// ---------- Inspection ----------
export function useInspections(raceId) {
  return useQuery({
    queryKey: ["referee", "inspections", raceId],
    queryFn: () => fetchInspections(raceId),
    enabled: !!raceId,
  });
}

export function useRecordInspection(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => recordInspection(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "inspections", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    },
  });
}

export function useSubmitAllInspections(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitAllInspections(raceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "inspections", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    },
  });
}

// ---------- Violations ----------
export function useRaceViolations(raceId) {
  return useQuery({
    queryKey: ["referee", "violations", "race", raceId],
    queryFn: () => fetchRaceViolations(raceId),
    enabled: !!raceId,
  });
}

export function useViolation(violationId) {
  return useQuery({
    queryKey: ["referee", "violation", violationId],
    queryFn: () => fetchViolation(violationId),
    enabled: !!violationId,
  });
}

export function useCreateViolation(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => createViolation(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "violations"] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    },
  });
}

export function useRecordRuling(violationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => recordRuling(violationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "violation", violationId] });
      qc.invalidateQueries({ queryKey: ["referee", "violations"] });
    },
  });
}

export function useUpdateViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => updateViolation(v.violationId, v.body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "violations"] }),
  });
}

export function useDeleteViolation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (violationId) => deleteViolation(violationId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "violations"] }),
  });
}

export function useRaceEntries(raceId) {
  return useQuery({
    queryKey: ["referee", "race-entries", raceId],
    queryFn: () => fetchRaceEntries(raceId),
    enabled: !!raceId,
  });
}

// ---------- Results ----------
export function useResults(raceId) {
  return useQuery({
    queryKey: ["referee", "results", raceId],
    queryFn: () => fetchResults(raceId),
    enabled: !!raceId,
  });
}

/** ADMIN-ONLY legacy save (no OTP). Referees publish via useSubmitReport. */
export function useRecordResults(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => recordResults(raceId, vars.results),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] }),
  });
}

/** CN3: email the referee a fresh OTP for this race. */
export function useRequestRefereeCode(raceId) {
  return useMutation({ mutationFn: () => requestRefereeCode(raceId) });
}

/** CN3: publish the combined report (results + violations) with the emailed OTP. */
export function useSubmitReport(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => submitReport(raceId, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    },
  });
}

/** CN3: flag a result row UNDER_REVIEW. */
export function useFlagInquiry(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultId) => flagInquiry(raceId, resultId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] }),
  });
}

export function useDeleteResult(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resultId) => deleteResult(raceId, resultId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] }),
  });
}

/** The signed-in referee's assignments incl. their per-race code. */
export function useMyAssignments() {
  return useQuery({
    queryKey: ["referee", "my-assignments"],
    queryFn: fetchMyAssignments,
  });
}

// ---------- Tournament invitations (referee accepts/declines) ----------
export function useMyTournamentInvitations() {
  return useQuery({
    queryKey: ["referee", "tournament-invitations"],
    queryFn: fetchMyTournamentInvitations,
  });
}
export function useAcceptTournamentInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptTournamentInvitation(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "tournament-invitations"] }),
  });
}
export function useRejectTournamentInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectTournamentInvitation(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "tournament-invitations"] }),
  });
}

// CN1: per-race assignment accept/decline
export function useMyRaceAssignments() {
  return useQuery({
    queryKey: ["referee", "race-assignments"],
    queryFn: fetchMyRaceAssignments,
  });
}
export function useAcceptRaceAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => acceptRaceAssignment(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "race-assignments"] }),
  });
}
export function useDeclineRaceAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => declineRaceAssignment(v.id, v.reason),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["referee", "race-assignments"] }),
  });
}

export function useCertifyResults(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => certifyResults(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "results", raceId] });
      qc.invalidateQueries({ queryKey: ["referee", "dashboard"] });
    },
  });
}

// ---------- Live monitor ----------
export function useLiveRace(raceId, refetchMs = 5000) {
  return useQuery({
    queryKey: ["referee", "live", raceId],
    queryFn: () => fetchLiveRace(raceId),
    enabled: !!raceId,
    refetchInterval: refetchMs,
  });
}

// ---------- Registration management ----------
export function useRegistrations(query) {
  return useQuery({
    queryKey: ["referee", "registrations", query],
    queryFn: () => fetchRegistrations(query),
  });
}

export function useRegistrationStats() {
  return useQuery({
    queryKey: ["referee", "registration-stats"],
    queryFn: fetchRegistrationStats,
  });
}

export function useHorsePassport(horseId) {
  return useQuery({
    queryKey: ["referee", "horse-passport", horseId],
    queryFn: () => fetchHorsePassport(horseId),
    enabled: !!horseId,
  });
}

export function useHorseVerification(horseId) {
  return useQuery({
    queryKey: ["referee", "horse-verification", horseId],
    queryFn: () => fetchHorseVerification(horseId),
    enabled: !!horseId,
  });
}

export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    },
  });
}

export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectRegistration(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    },
  });
}

/** Referee/admin soft-remove of a registration (DELETE → status REMOVED). */
export function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "registrations"] });
      qc.invalidateQueries({ queryKey: ["referee", "registration-stats"] });
    },
  });
}

// ---------- Applicant onboarding (Registration Approval) ----------
// retry:false — the BE endpoints are spec-only for now, so fail fast to an empty/error state.
export function useApplications(query) {
  return useQuery({
    queryKey: ["referee", "applications", query],
    queryFn: () => fetchApplications(query),
    retry: false,
  });
}

export function useApplicationStats() {
  return useQuery({
    queryKey: ["referee", "application-stats"],
    queryFn: fetchApplicationStats,
    retry: false,
  });
}

export function useApplication(id) {
  return useQuery({
    queryKey: ["referee", "application", id],
    queryFn: () => fetchApplication(id),
    enabled: !!id,
    retry: false,
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application-stats"] });
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectApplication(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application-stats"] });
    },
  });
}

export function useRequestApplicationInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => requestApplicationInfo(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referee", "applications"] });
      qc.invalidateQueries({ queryKey: ["referee", "application"] });
    },
  });
}
