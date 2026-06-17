import api from "./api";
import initialHorses from "../data/horseMock.json";

const STORAGE_KEY = "equine_elite_horses";

// Initialize localStorage if not set
if (!localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialHorses));
}

function getLocalHorses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveLocalHorses(horses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(horses));
}

export async function getHorses() {
  try {
    const response = await api.get("/v1/horses");
    if (response.data?.success) {
      return response.data.data;
    }
  } catch (err) {
    console.warn("API getHorses failed, falling back to mock data:", err.message);
  }
  return getLocalHorses();
}

export async function getHorseDetail(id) {
  try {
    const response = await api.get(`/v1/horses/${id}`);
    if (response.data?.success) {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`API getHorseDetail for ${id} failed, falling back to mock data:`, err.message);
  }
  const horses = getLocalHorses();
  return horses.find(h => h.id === id) || null;
}

export async function createHorse(horseData) {
  try {
    const response = await api.post("/v1/horses", horseData);
    if (response.data?.success) {
      return response.data.data;
    }
  } catch (err) {
    console.warn("API createHorse failed, falling back to mock data:", err.message);
  }
  const horses = getLocalHorses();
  const newHorse = {
    id: `hr_${Date.now()}`,
    nextRace: "No upcoming races",
    track: "",
    cogginsTest: "Up to date",
    vaccines: "Current",
    raceHistory: [
      { date: "May 10, 2026", race: "Preakness Stakes", jockey: "J. Ortiz", place: "2nd", prize: "$150,000" }
    ],
    ...horseData,
    details: `${horseData.age} ${horseData.breed}`,
    medicalStatus: horseData.status === "FIT TO RACE" ? "Fit for Racing" : "Resting/Unfit"
  };
  saveLocalHorses([newHorse, ...horses]);
  return newHorse;
}

export async function updateHorse(id, horseData) {
  try {
    const response = await api.put(`/v1/horses/${id}`, horseData);
    if (response.data?.success) {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`API updateHorse for ${id} failed, falling back to mock data:`, err.message);
  }
  const horses = getLocalHorses();
  let updatedHorse = null;
  const updatedList = horses.map(h => {
    if (h.id === id) {
      updatedHorse = {
        ...h,
        ...horseData,
        details: `${horseData.age || h.age} ${horseData.breed || h.breed}`,
        medicalStatus: horseData.status ? (horseData.status === "FIT TO RACE" ? "Fit for Racing" : "Resting/Unfit") : h.medicalStatus
      };
      return updatedHorse;
    }
    return h;
  });
  saveLocalHorses(updatedList);
  return updatedHorse;
}

export async function deleteHorse(id) {
  try {
    const response = await api.delete(`/v1/horses/${id}`);
    if (response.data?.success) {
      return true;
    }
  } catch (err) {
    console.warn(`API deleteHorse for ${id} failed, falling back to mock data:`, err.message);
  }
  const horses = getLocalHorses();
  const filtered = horses.filter(h => h.id !== id);
  saveLocalHorses(filtered);
  return true;
}

export async function assignHorseToRace(id, race) {
  try {
    const response = await api.post(`/v1/horses/${id}/assign`, { raceId: race.id });
    if (response.data?.success) {
      return response.data.data;
    }
  } catch (err) {
    console.warn(`API assignHorseToRace for ${id} failed, falling back to mock data:`, err.message);
  }
  const horses = getLocalHorses();
  let updatedHorse = null;
  const updatedList = horses.map(h => {
    if (h.id === id) {
      updatedHorse = {
        ...h,
        nextRace: race.date,
        track: race.track
      };
      return updatedHorse;
    }
    return h;
  });
  saveLocalHorses(updatedList);
  return updatedHorse;
}

export async function toggleMedicalStatus(id) {
  const horses = getLocalHorses();
  let updatedHorse = null;
  const updatedList = horses.map(h => {
    if (h.id === id) {
      const nextStatus = h.status === 'FIT TO RACE' ? 'RESTING' : 'FIT TO RACE';
      updatedHorse = {
        ...h,
        status: nextStatus,
        medicalStatus: nextStatus === 'FIT TO RACE' ? "Fit for Racing" : "Resting/Unfit",
        cogginsTest: nextStatus === 'FIT TO RACE' ? "Up to date" : "Expiring Soon"
      };
      return updatedHorse;
    }
    return h;
  });
  saveLocalHorses(updatedList);
  return updatedHorse;
}
