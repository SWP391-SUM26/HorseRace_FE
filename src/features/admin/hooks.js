import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRegistration,
  assignReferee,
  cancelRace,
  changeUserRole,
  changeUserStatus,
  fetchHorses,
  fetchHorseMedical,
  fetchAdminJockeys,
  fetchAdminJockey,
  approveJockey,
  rejectJockey,
  createRace,
  createTournament,
  uploadTournamentImage,
  deleteRace,
  deleteTournament,
  deleteUser,
  fetchAssignments,
  fetchHorse,
  fetchUser,
  fetchUserStats,
  fetchUserHorses,
  fetchUserWins,
  fetchRace,
  fetchRacePanel,
  fetchRaceStats,
  fetchRaceEntries,
  fetchRaces,
  fetchRegistrationStats,
  fetchRegistrations,
  fetchStaff,
  fetchRefereeConflicts,
  fetchStaffingDashboard,
  fetchTournament,
  fetchTournamentAssignments,
  fetchTournaments,
  inviteTournamentReferee,
  provisionUser,
  publishTournament,
  openTournamentRegistration,
  closeTournamentRegistration,
  startTournament,
  completeTournament,
  reassignReferee,
  rejectRegistration,
  removeAssignment,
  revokeTournamentAssignment,
  scheduleRace,
  closeRace,
  startRace,
  finishRace,
  updateRace,
  updateTournament,
  updateUser,
  fetchUsers,
  fetchWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from "./api";
function useWithdrawals(query = {}) {
  return useQuery({ queryKey: ["admin", "withdrawals", query], queryFn: () => fetchWithdrawals(query) });
}
function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveWithdrawal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] })
  });
}
function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => rejectWithdrawal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "withdrawals"] })
  });
}
function useRegistrations(query) {
  return useQuery({ queryKey: ["admin", "registrations", query], queryFn: () => fetchRegistrations(query) });
}
function useRegistrationStats() {
  return useQuery({ queryKey: ["admin", "registration-stats"], queryFn: fetchRegistrationStats });
}
function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
      qc.invalidateQueries({ queryKey: ["admin", "registration-stats"] });
    }
  });
}
function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectRegistration(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
      qc.invalidateQueries({ queryKey: ["admin", "registration-stats"] });
    }
  });
}
function useUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers });
}
function useUser(id) {
  return useQuery({ queryKey: ["admin", "user", id], queryFn: () => fetchUser(id), enabled: !!id });
}
function useUserStats() {
  return useQuery({ queryKey: ["admin", "user-stats"], queryFn: fetchUserStats });
}
function useUserHorses(ownerUserId) {
  return useQuery({ queryKey: ["admin", "user-horses", ownerUserId], queryFn: () => fetchUserHorses(ownerUserId), enabled: !!ownerUserId });
}
function useUserWins(userId) {
  return useQuery({ queryKey: ["admin", "user-wins", userId], queryFn: () => fetchUserWins(userId), enabled: !!userId });
}
function useHorse(id) {
  return useQuery({ queryKey: ["admin", "horse", id], queryFn: () => fetchHorse(id), enabled: !!id });
}
function useAdminHorses(query) {
  return useQuery({ queryKey: ["admin", "horses", query], queryFn: () => fetchHorses(query) });
}
function useAdminHorse(id) {
  return useQuery({ queryKey: ["admin", "horse-detail", id], queryFn: () => fetchHorse(id), enabled: !!id });
}
function useHorseMedical(id) {
  return useQuery({ queryKey: ["admin", "horse-medical", id], queryFn: () => fetchHorseMedical(id), enabled: !!id });
}
function useAdminJockeys(query) {
  return useQuery({ queryKey: ["admin", "jockeys", query], queryFn: () => fetchAdminJockeys(query) });
}
function useAdminJockey(id) {
  return useQuery({ queryKey: ["admin", "jockey", id], queryFn: () => fetchAdminJockey(id), enabled: !!id });
}
function useApproveJockey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveJockey(id),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "jockeys"] });
      qc.invalidateQueries({ queryKey: ["admin", "jockey", id] });
    }
  });
}
function useRejectJockey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectJockey(id, reason),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "jockeys"] });
      qc.invalidateQueries({ queryKey: ["admin", "jockey", id] });
    }
  });
}
function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => deleteUser(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }) });
}
function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}
function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleCode }) => changeUserRole(id, roleCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}
function useChangeUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) => changeUserStatus(id, status, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}
function useProvisionUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => provisionUser(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}
function useTournaments(query) {
  return useQuery({ queryKey: ["admin", "tournaments", query], queryFn: () => fetchTournaments(query) });
}
function useTournament(id) {
  return useQuery({ queryKey: ["admin", "tournament", id], queryFn: () => fetchTournament(id), enabled: !!id });
}
function useCreateTournament() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => createTournament(body), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournaments"] }) });
}
function useUpdateTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateTournament(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournaments"] })
  });
}
function useUploadTournamentImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => uploadTournamentImage(id, file),
    // Divergent per-site error text (plain revert vs. "tournament created; upload failed") → self-rendered.
    meta: { skipGlobalErrorToast: true },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      qc.invalidateQueries({ queryKey: ["admin", "tournament", id] });
    }
  });
}
function usePublishTournament() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => publishTournament(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournaments"] }) });
}
function useTournamentTransition(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fn(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "tournaments"] });
      qc.invalidateQueries({ queryKey: ["admin", "tournament", id] });
    }
  });
}
function useOpenTournamentRegistration() {
  return useTournamentTransition(openTournamentRegistration);
}
function useCloseTournamentRegistration() {
  return useTournamentTransition(closeTournamentRegistration);
}
function useStartTournament() {
  return useTournamentTransition(startTournament);
}
function useCompleteTournament() {
  return useTournamentTransition(completeTournament);
}
function useDeleteTournament() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => deleteTournament(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournaments"] }) });
}
function useRaces(query) {
  return useQuery({ queryKey: ["admin", "races", query], queryFn: () => fetchRaces(query) });
}
function useRace(id) {
  return useQuery({ queryKey: ["admin", "race", id], queryFn: () => fetchRace(id), enabled: !!id });
}
function useRaceStats(tournamentId) {
  return useQuery({ queryKey: ["admin", "race-stats", tournamentId ?? null], queryFn: () => fetchRaceStats(tournamentId) });
}
function useRaceEntries(raceId) {
  return useQuery({ queryKey: ["admin", "race-entries", raceId], queryFn: () => fetchRaceEntries(raceId), enabled: !!raceId });
}
function invalidateRaces(qc) {
  qc.invalidateQueries({ queryKey: ["admin", "races"] });
  qc.invalidateQueries({ queryKey: ["admin", "race"] });
  qc.invalidateQueries({ queryKey: ["admin", "race-stats"] });
  qc.invalidateQueries({ queryKey: ["races", "calendar"] });
  qc.invalidateQueries({ queryKey: ["races", "details"] });
}
function useCreateRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => createRace(body), onSuccess: () => invalidateRaces(qc) });
}
function useUpdateRace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateRace(id, body),
    onSuccess: () => invalidateRaces(qc)
  });
}
function useDeleteRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => deleteRace(id), onSuccess: () => invalidateRaces(qc) });
}
function useScheduleRace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledStartAt }) => scheduleRace(id, scheduledStartAt),
    onSuccess: () => invalidateRaces(qc)
  });
}
function useStartRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => startRace(id), onSuccess: () => invalidateRaces(qc) });
}
function useCloseRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => closeRace(id), onSuccess: () => invalidateRaces(qc) });
}
function useFinishRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => finishRace(id), onSuccess: () => invalidateRaces(qc) });
}
function useCancelRace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => cancelRace(id), onSuccess: () => invalidateRaces(qc) });
}
function useStaffingDashboard() {
  return useQuery({ queryKey: ["admin", "staffing-dashboard"], queryFn: fetchStaffingDashboard });
}
function useAssignments(query) {
  return useQuery({ queryKey: ["admin", "assignments", query], queryFn: () => fetchAssignments(query) });
}
function useStaff() {
  return useQuery({ queryKey: ["admin", "staff"], queryFn: fetchStaff });
}
function useRacePanel(raceId) {
  return useQuery({ queryKey: ["admin", "race-panel", raceId], queryFn: () => fetchRacePanel(raceId), enabled: !!raceId });
}
function useRefereeConflicts(raceId) {
  return useQuery({ queryKey: ["admin", "referee-conflicts", raceId], queryFn: () => fetchRefereeConflicts(raceId), enabled: !!raceId });
}
function invalidateStaffing(qc) {
  qc.invalidateQueries({ queryKey: ["admin", "assignments"] });
  qc.invalidateQueries({ queryKey: ["admin", "race-panel"] });
  qc.invalidateQueries({ queryKey: ["admin", "staffing-dashboard"] });
  qc.invalidateQueries({ queryKey: ["admin", "staff"] });
}
function useAssignReferee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => assignReferee(body),
    // Batch-assigned via Promise.allSettled with a composite error toast → self-rendered.
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => invalidateStaffing(qc)
  });
}
function useReassignReferee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, newRefereeUserId, panelRole }) => reassignReferee(assignmentId, newRefereeUserId, panelRole),
    onSuccess: () => invalidateStaffing(qc)
  });
}
function useRemoveAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId) => removeAssignment(assignmentId),
    onSuccess: () => invalidateStaffing(qc)
  });
}
function useTournamentAssignments(tournamentId) {
  return useQuery({
    queryKey: ["admin", "tournament-assignments", tournamentId],
    queryFn: () => fetchTournamentAssignments(tournamentId),
    enabled: !!tournamentId
  });
}
function useInviteTournamentReferee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => inviteTournamentReferee(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournament-assignments"] })
  });
}
function useRevokeTournamentAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => revokeTournamentAssignment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "tournament-assignments"] })
  });
}
export {
  useAdminHorse,
  useAdminHorses,
  useAdminJockey,
  useAdminJockeys,
  useApproveJockey,
  useApproveRegistration,
  useApproveWithdrawal,
  useAssignReferee,
  useAssignments,
  useCancelRace,
  useChangeUserRole,
  useChangeUserStatus,
  useCloseTournamentRegistration,
  useCompleteTournament,
  useCreateRace,
  useCreateTournament,
  useDeleteRace,
  useDeleteTournament,
  useDeleteUser,
  useFinishRace,
  useHorse,
  useHorseMedical,
  useInviteTournamentReferee,
  useOpenTournamentRegistration,
  useProvisionUser,
  usePublishTournament,
  useRace,
  useRaceEntries,
  useRacePanel,
  useRaceStats,
  useRaces,
  useReassignReferee,
  useRefereeConflicts,
  useRegistrationStats,
  useRegistrations,
  useRejectJockey,
  useRejectRegistration,
  useRejectWithdrawal,
  useRemoveAssignment,
  useRevokeTournamentAssignment,
  useScheduleRace,
  useStaff,
  useStaffingDashboard,
  useStartRace,
  useCloseRace,
  useStartTournament,
  useTournament,
  useTournamentAssignments,
  useTournaments,
  useUpdateRace,
  useUpdateTournament,
  useUpdateUser,
  useUploadTournamentImage,
  useUser,
  useUserHorses,
  useUserStats,
  useUserWins,
  useUsers,
  useWithdrawals
};
