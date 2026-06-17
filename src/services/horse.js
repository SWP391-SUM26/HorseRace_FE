import api from "./api";

// Helper: Map BE response to include UI-required mock fields (because BE doesn't have cogginsTest, vaccines)
function mapHorseToUI(horse) {
  if (!horse) return null;
  return {
    ...horse,
    id: horse.horseId,
    medicalStatus: horse.healthStatus === "HEALTHY" ? "Fit for Racing" : "Resting/Unfit",
    cogginsTest: horse.healthStatus === "HEALTHY" ? "Up to date" : "Expiring Soon",
    vaccines: "Current",
    details: `${horse.breed || "Unknown Breed"} - ${horse.gender || "Unknown"}`
  };
}

// 1 - 5. Get List, Search, Filter, Sort, Pagination
export async function getHorses(params = {}) {
  const response = await api.get("/v1/horses", { params });
  const data = response.data?.data;
  if (data?.content) {
    return data.content.map(mapHorseToUI);
  }
  return Array.isArray(data) ? data.map(mapHorseToUI) : [];
}

// 6. Get Detail
export async function getHorseDetail(id) {
  const response = await api.get(`/v1/horses/${id}`);
  return mapHorseToUI(response.data?.data);
}

// 7. Create
export async function createHorse(horseData) {
  const response = await api.post("/v1/horses", horseData);
  return mapHorseToUI(response.data?.data);
}

// 8. Update
export async function updateHorse(id, horseData) {
  const response = await api.put(`/v1/horses/${id}`, horseData);
  return mapHorseToUI(response.data?.data);
}

// 9. Delete
export async function deleteHorse(id) {
  const response = await api.delete(`/v1/horses/${id}`);
  return response.data?.success;
}

// 10. Upload Image
export async function uploadHorseImage(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/v1/horses/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapHorseToUI(response.data?.data);
}

// 11. Get Medical Status
export async function getMedicalStatus(id) {
  const horse = await getHorseDetail(id);
  // Trả về mock chi tiết y tế cho UI
  return {
    healthStatus: horse?.healthStatus || "UNKNOWN",
    medicalStatus: horse?.medicalStatus || "Unknown",
    cogginsTest: horse?.cogginsTest || "Unknown",
    vaccines: horse?.vaccines || "Unknown"
  };
}

// 12. Update Medical Status
export async function updateMedicalStatus(id, healthStatus) {
  return await updateHorse(id, { healthStatus });
}

// 13. Get Race History (Chưa có API Backend - Giữ Mock Data)
export async function getHorseRaceHistory(id) {
  console.warn(`[BE Missing API] getHorseRaceHistory for ${id}`);
  return [
    { id: "race_1", date: "May 10, 2026", name: "Preakness Stakes", jockey: "J. Ortiz", place: "2nd", prize: "$150,000" },
    { id: "race_2", date: "Apr 15, 2026", name: "Kentucky Derby", jockey: "M. Smith", place: "1st", prize: "$300,000" }
  ];
}

// 14. Assign To Race (Chưa có API Backend - Giữ Mock Data)
export async function assignHorseToRace(id, raceId) {
  console.warn(`[BE Missing API] assignHorseToRace for horse ${id}`);
  // Trả về mock success để UI hiển thị thông báo thành công
  return { success: true, message: "Assigned to race successfully (Mock)" };
}

// Backwards compatibility cho UI
export async function toggleMedicalStatus(id) {
  const horse = await getHorseDetail(id);
  if (!horse) throw new Error("Horse not found");
  
  const nextStatus = horse.healthStatus === "HEALTHY" ? "UNFIT" : "HEALTHY";
  return await updateHorse(id, { healthStatus: nextStatus });
}
