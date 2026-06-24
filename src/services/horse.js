import api from "./api";

// Map Backend HorseResponse to Frontend mock structure
function mapBackendHorseToFrontend(be) {
  if (!be) return null;
  return {
    ...be,
    id: be.horseId || be.id,
    age: "3yo", // Placeholder since frontend expects age string
    breed: be.breed || "Unknown",
    status: be.healthStatus === "INJURED" ? "INJURED" : (be.status === "ACTIVE" ? "FIT TO RACE" : "RESTING"),
    image: be.imageUrl || be.image || "/assets/dashboard_monitor.png",
    details: `3yo ${be.breed || "Unknown"}`,
    nextRace: "No upcoming races",
    track: "",
    cogginsTest: "Up to date",
    vaccines: "Current",
    medicalStatus: be.healthStatus === "INJURED" ? "Resting/Unfit" : "Fit for Racing"
  };
}

// Map Frontend form data to Backend HorseRequest payload
function mapFrontendHorseToBackend(fe) {
  return {
    name: fe.name,
    microchipNo: "MC-" + Math.floor(Math.random() * 10000000),
    gender: "MALE",
    breed: fe.breed || "Thoroughbred",
    color: "Bay",
    dateOfBirth: "2023-01-01",
    weight: 500.0,
    originCountry: "USA",
    healthStatus: fe.status === "INJURED" ? "INJURED" : "HEALTHY",
    registrationStatus: "VERIFIED",
    status: fe.status === "RESTING" ? "INACTIVE" : "ACTIVE"
  };
}

export async function getHorses() {
  const response = await api.get("/api/v1/horses");
  if (response.data?.success) {
    const data = response.data.data;
    const horses = Array.isArray(data) ? data : (data?.content || []);
    return horses.map(mapBackendHorseToFrontend);
  }
  throw new Error(response.data?.message || "Failed to fetch horses");
}

export async function getHorseDetail(id) {
  const response = await api.get(`/api/v1/horses/${id}`);
  if (response.data?.success) {
    return mapBackendHorseToFrontend(response.data.data);
  }
  throw new Error(response.data?.message || "Failed to fetch horse details");
}

export async function createHorse(horseData) {
  const payload = mapFrontendHorseToBackend(horseData);
  const response = await api.post("/api/v1/horses", payload);
  if (response.data?.success) {
    return mapBackendHorseToFrontend(response.data.data);
  }
  throw new Error(response.data?.message || "Failed to create horse");
}

export async function updateHorse(id, horseData) {
  const payload = mapFrontendHorseToBackend(horseData);
  const response = await api.put(`/api/v1/horses/${id}`, payload);
  if (response.data?.success) {
    return mapBackendHorseToFrontend(response.data.data);
  }
  throw new Error(response.data?.message || "Failed to update horse");
}

export async function deleteHorse(id) {
  const response = await api.delete(`/api/v1/horses/${id}`);
  if (response.data?.success) {
    return true;
  }
  throw new Error(response.data?.message || "Failed to delete horse");
}

export async function assignHorseToRace(id, race) {
  const response = await api.post(`/api/v1/horses/${id}/assign-to-race`, { raceId: race.id });
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "Failed to assign horse to race");
}

export async function updateMedicalStatus(id, statusData) {
  try {
    const response = await api.patch(`/api/v1/horses/${id}/medical-status`, statusData);
    return response.data?.data || response.data;
  } catch (err) {
    console.error(`API updateMedicalStatus for ${id} failed:`, err.message);
    throw err;
  }
}

export async function toggleMedicalStatus(id) {
  throw new Error("Medical status toggle via this API is not supported yet");
}

export async function getHorseMedicalStatus(id) {
  try {
    const response = await api.get(`/api/v1/horses/${id}/medical-status`);
    return response.data?.data || response.data;
  } catch (err) {
    console.error('API getHorseMedicalStatus for ' + id + ' failed:', err.message);
    throw err;
  }
}

export async function getHorseStats(id) {
  const response = await api.get(`/api/v1/horses/${id}/stats`);
  return response.data?.data || response.data;
}

export async function getHorseRaceHistory(id) {
  const response = await api.get(`/api/v1/horses/${id}/race-history`);
  return response.data?.data || response.data;
}

export async function getHorsePedigree(id) {
  const response = await api.get(`/api/v1/horses/${id}/pedigree`);
  return response.data?.data || response.data;
}

export async function getHorseImage(id) {
  const response = await api.get(`/api/v1/horses/${id}/image`);
  return response.data?.data || response.data;
}

export async function uploadHorseImage(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/api/v1/horses/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data?.data || response.data;
}
