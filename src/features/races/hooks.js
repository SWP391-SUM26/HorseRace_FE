import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  certifyRaceResults,
  fetchOwnerRaceIds,
  fetchOwnerRaceReport,
  fetchRaceCalendar,
  fetchRaceReportViolations,
  fetchRaceResultSheet,
  fetchRefereeRaceIds,
} from "./api";

export function useRaceCalendar() {
  return useQuery({ queryKey: ["races", "calendar"], queryFn: fetchRaceCalendar });
}

export function useOwnerRaceIds(options = {}) {
  return useQuery({
    queryKey: ["owner", "race-ids"],
    queryFn: fetchOwnerRaceIds,
    ...options,
  });
}

export function useOwnerRaceReport() {
  return useQuery({ queryKey: ["owner", "race-report"], queryFn: fetchOwnerRaceReport });
}

export function useRefereeRaceIds(options = {}) {
  return useQuery({
    queryKey: ["referee", "race-ids"],
    queryFn: fetchRefereeRaceIds,
    ...options,
  });
}

export function useRaceResultSheet(raceId) {
  return useQuery({
    queryKey: ["races", "result-sheet", raceId],
    queryFn: () => fetchRaceResultSheet(raceId),
    enabled: !!raceId,
  });
}

export function useRaceReportViolations(raceId) {
  return useQuery({
    queryKey: ["races", "report-violations", raceId],
    queryFn: () => fetchRaceReportViolations(raceId),
    enabled: !!raceId,
  });
}

export function useCertifyRaceResults(raceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stewardsReport) => certifyRaceResults(raceId, stewardsReport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["races", "result-sheet", raceId] });
      queryClient.invalidateQueries({ queryKey: ["races", "calendar"] });
    },
  });
}
