import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveRegistration,
  certifyResults,
  createViolation,
  fetchHorsePassport,
  fetchHorseVerification,
  fetchInspections,
  fetchLiveRace,
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
  rejectRegistration,
  submitAllInspections,
  type RegistrationQuery,
} from './api';
import type { CertifyResultsRequest, CreateViolationRequest, InspectionRequest, RulingRequest } from './types';

// ---------- Dashboard ----------
export function useRefereeDashboard(enabled = true) {
  return useQuery({ queryKey: ['referee', 'dashboard'], queryFn: fetchRefereeDashboard, enabled });
}

// ---------- Races picker ----------
export function useRefereeRaces() {
  return useQuery({ queryKey: ['referee', 'races'], queryFn: fetchRefereeRaces });
}

// ---------- Inspection ----------
export function useInspections(raceId: string | null) {
  return useQuery({
    queryKey: ['referee', 'inspections', raceId],
    queryFn: () => fetchInspections(raceId!),
    enabled: !!raceId,
  });
}

export function useRecordInspection(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InspectionRequest) => recordInspection(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'inspections', raceId] });
      qc.invalidateQueries({ queryKey: ['referee', 'dashboard'] });
    },
  });
}

export function useSubmitAllInspections(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitAllInspections(raceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'inspections', raceId] });
      qc.invalidateQueries({ queryKey: ['referee', 'dashboard'] });
    },
  });
}

// ---------- Violations ----------
export function useRaceViolations(raceId: string | null) {
  return useQuery({
    queryKey: ['referee', 'violations', 'race', raceId],
    queryFn: () => fetchRaceViolations(raceId!),
    enabled: !!raceId,
  });
}

export function useViolation(violationId: string | null) {
  return useQuery({
    queryKey: ['referee', 'violation', violationId],
    queryFn: () => fetchViolation(violationId!),
    enabled: !!violationId,
  });
}

export function useCreateViolation(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateViolationRequest) => createViolation(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'violations'] });
      qc.invalidateQueries({ queryKey: ['referee', 'dashboard'] });
    },
  });
}

export function useRecordRuling(violationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RulingRequest) => recordRuling(violationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'violation', violationId] });
      qc.invalidateQueries({ queryKey: ['referee', 'violations'] });
    },
  });
}

// ---------- Results ----------
export function useResults(raceId: string | null) {
  return useQuery({
    queryKey: ['referee', 'results', raceId],
    queryFn: () => fetchResults(raceId!),
    enabled: !!raceId,
  });
}

export function useRecordResults(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      results: { entryId: string; finishPosition?: number; finishTimeMs?: number; lengthsBehind?: number; score?: number }[],
    ) => recordResults(raceId, results),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referee', 'results', raceId] }),
  });
}

export function useCertifyResults(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CertifyResultsRequest) => certifyResults(raceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'results', raceId] });
      qc.invalidateQueries({ queryKey: ['referee', 'dashboard'] });
    },
  });
}

// ---------- Live monitor ----------
export function useLiveRace(raceId: string | null, refetchMs = 5000) {
  return useQuery({
    queryKey: ['referee', 'live', raceId],
    queryFn: () => fetchLiveRace(raceId!),
    enabled: !!raceId,
    refetchInterval: refetchMs,
  });
}

// ---------- Registration management ----------
export function useRegistrations(query: RegistrationQuery) {
  return useQuery({
    queryKey: ['referee', 'registrations', query],
    queryFn: () => fetchRegistrations(query),
  });
}

export function useRegistrationStats() {
  return useQuery({ queryKey: ['referee', 'registration-stats'], queryFn: fetchRegistrationStats });
}

export function useHorsePassport(horseId: string | null) {
  return useQuery({
    queryKey: ['referee', 'horse-passport', horseId],
    queryFn: () => fetchHorsePassport(horseId!),
    enabled: !!horseId,
  });
}

export function useHorseVerification(horseId: string | null) {
  return useQuery({
    queryKey: ['referee', 'horse-verification', horseId],
    queryFn: () => fetchHorseVerification(horseId!),
    enabled: !!horseId,
  });
}

export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'registrations'] });
      qc.invalidateQueries({ queryKey: ['referee', 'registration-stats'] });
    },
  });
}

export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectRegistration(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['referee', 'registrations'] });
      qc.invalidateQueries({ queryKey: ['referee', 'registration-stats'] });
    },
  });
}
