import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOwnerHorseList,
  fetchHorse,
  fetchHorseProfile,
  fetchEnterableRaces,
  createHorse,
  updateHorse,
  deleteHorse,
  uploadHorseImage,
  enterHorseInRace,
  fetchMedicalRecords,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadMedicalRecordFile
} from "./api";
const HORSES_KEY = ["stable", "horses"];
function useOwnerHorses() {
  return useQuery({ queryKey: HORSES_KEY, queryFn: fetchOwnerHorseList });
}
function useHorseProfile(id) {
  return useQuery({ queryKey: ["stable", "horse", id], queryFn: () => fetchHorseProfile(id), enabled: !!id });
}
function useHorse(id) {
  return useQuery({ queryKey: ["stable", "horse-raw", id], queryFn: () => fetchHorse(id), enabled: !!id });
}
function useEnterableRaces(horseId) {
  return useQuery({
    queryKey: ["races", "enterable", horseId],
    queryFn: () => fetchEnterableRaces(horseId),
    enabled: !!horseId
  });
}
function useCreateHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars) => {
      const horse = await createHorse(vars.values);
      if (vars.image) await uploadHorseImage(horse.horseId, vars.image);
      return horse;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HORSES_KEY })
  });
}
function useUpdateHorse(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values) => updateHorse(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HORSES_KEY });
      qc.invalidateQueries({ queryKey: ["stable", "horse", id] });
    }
  });
}
function useDeleteHorse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteHorse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: HORSES_KEY })
  });
}
function useEnterRace(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (raceId) => enterHorseInRace(horseId, raceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stable", "horse", horseId] });
      qc.invalidateQueries({ queryKey: ["races", "enterable", horseId] });
    }
  });
}
const medKey = (horseId) => ["stable", "medical-records", horseId];
function useMedicalRecords(horseId) {
  return useQuery({ queryKey: medKey(horseId), queryFn: () => fetchMedicalRecords(horseId), enabled: !!horseId });
}
function useAddMedicalRecord(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => addMedicalRecord(horseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: medKey(horseId) })
  });
}
function useUpdateMedicalRecord(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v) => updateMedicalRecord(horseId, v.recordId, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: medKey(horseId) })
  });
}
function useDeleteMedicalRecord(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId) => deleteMedicalRecord(horseId, recordId),
    onSuccess: () => qc.invalidateQueries({ queryKey: medKey(horseId) })
  });
}
function useUploadMedicalRecordFile(horseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, file }) => uploadMedicalRecordFile(horseId, recordId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: medKey(horseId) })
  });
}
export {
  useAddMedicalRecord,
  useCreateHorse,
  useDeleteHorse,
  useDeleteMedicalRecord,
  useEnterRace,
  useEnterableRaces,
  useHorse,
  useHorseProfile,
  useMedicalRecords,
  useOwnerHorses,
  useUpdateHorse,
  useUpdateMedicalRecord,
  useUploadMedicalRecordFile
};
