import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRaceCalendar,
  fetchOwnerRaceIds,
  fetchRefereeRaceIds,
  fetchRaceResultSheet,
  fetchRaceReportViolations,
  certifyRaceResults,
  fetchOwnerRaceReport
} from "./api";
function useRaceCalendar() {
  return useQuery({ queryKey: ["races", "calendar"], queryFn: fetchRaceCalendar });
}
function useOwnerRaceIds() {
  return useQuery({ queryKey: ["owner", "race-ids"], queryFn: fetchOwnerRaceIds });
}
function useOwnerRaceReport() {
  return useQuery({ queryKey: ["owner", "race-report"], queryFn: fetchOwnerRaceReport });
}
function useRefereeRaceIds() {
  return useQuery({ queryKey: ["referee", "race-ids"], queryFn: fetchRefereeRaceIds });
}
function useRaceResultSheet(raceId) {
  return useQuery({
    queryKey: ["races", "result-sheet", raceId],
    queryFn: () => fetchRaceResultSheet(raceId),
    enabled: !!raceId
  });
}
function useRaceReportViolations(raceId) {
  return useQuery({
    queryKey: ["races", "report-violations", raceId],
    queryFn: () => fetchRaceReportViolations(raceId),
    enabled: !!raceId
  });
}
function useCertifyRaceResults(raceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stewardsReport) => certifyRaceResults(raceId, stewardsReport),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["races", "result-sheet", raceId] });
      qc.invalidateQueries({ queryKey: ["races", "calendar"] });
    }
  });
}
export {
  useCertifyRaceResults,
  useOwnerRaceIds,
  useOwnerRaceReport,
  useRaceCalendar,
  useRaceReportViolations,
  useRaceResultSheet,
  useRefereeRaceIds
};
