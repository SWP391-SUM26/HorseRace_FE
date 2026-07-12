import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchRaceDetails, fetchRaceCalendar, fetchOwnerRaceIds, fetchRefereeRaceIds,
  fetchRaceResultSheet, fetchRaceReportViolations, certifyRaceResults, fetchOwnerRaceReport,
} from './api';
import type { RaceDetailsVM } from './types';

export function useRaceDetails() {
  return useQuery<RaceDetailsVM | null>({
    queryKey: ['races', 'details'],
    queryFn: fetchRaceDetails,
  });
}

export function useRaceCalendar() {
  return useQuery({ queryKey: ['races', 'calendar'], queryFn: fetchRaceCalendar });
}

export function useOwnerRaceIds() {
  return useQuery({ queryKey: ['owner', 'race-ids'], queryFn: fetchOwnerRaceIds });
}

export function useOwnerRaceReport() {
  return useQuery({ queryKey: ['owner', 'race-report'], queryFn: fetchOwnerRaceReport });
}

export function useRefereeRaceIds() {
  return useQuery({ queryKey: ['referee', 'race-ids'], queryFn: fetchRefereeRaceIds });
}

export function useRaceResultSheet(raceId: string) {
  return useQuery({
    queryKey: ['races', 'result-sheet', raceId],
    queryFn: () => fetchRaceResultSheet(raceId),
    enabled: !!raceId,
  });
}

export function useRaceReportViolations(raceId: string) {
  return useQuery({
    queryKey: ['races', 'report-violations', raceId],
    queryFn: () => fetchRaceReportViolations(raceId),
    enabled: !!raceId,
  });
}

/** Admin-only: publish/certify a race's results as OFFICIAL. */
export function useCertifyRaceResults(raceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stewardsReport?: string) => certifyRaceResults(raceId, stewardsReport),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['races', 'result-sheet', raceId] });
      qc.invalidateQueries({ queryKey: ['races', 'calendar'] });
    },
  });
}
