import { apiClient } from "@/common/lib/apiClient";
function titleCase(value) {
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function mapHorse(h) {
  return {
    id: h.horseId,
    registrationId: h.registrationCode,
    name: h.name,
    status: titleCase(h.status),
    earnings: h.earnings
  };
}
function mapRace(r) {
  return {
    id: r.raceId,
    name: r.name,
    course: r.venue,
    date: r.date,
    yourHorse: r.yourHorse,
    entryStatus: titleCase(r.entryStatus)
  };
}
async function fetchOwnerOverview() {
  const { data } = await apiClient.get("/owner/overview");
  const raw = data.data;
  const seen = /* @__PURE__ */ new Set();
  const upcomingRaces = raw.upcomingRaces.map(mapRace).filter((r) => {
    const key = `${r.id}|${r.yourHorse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    kpis: raw.kpis,
    horses: raw.horses.map(mapHorse),
    upcomingRaces
  };
}
async function fetchOwnerRaceRegistrations(params) {
  const { data } = await apiClient.get(
    "/registrations",
    { params: { ownerUserId: params.ownerUserId, raceId: params.raceId, size: 100 } }
  );
  const d = data.data;
  return Array.isArray(d) ? d : d?.content ?? [];
}
async function uploadOwnerDocument(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerType", "OWNER");
  const { data } = await apiClient.post("/owner/documents", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}
async function uploadHorseDocument(horseId, file) {
  const form = new FormData();
  form.append("file", file);
  form.append("ownerType", "HORSE");
  form.append("horseId", horseId);
  const { data } = await apiClient.post("/owner/documents", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}
async function fetchOwnerDocuments() {
  const { data } = await apiClient.get("/owner/documents");
  return data.data ?? [];
}
async function fetchHorseDocuments(horseId) {
  const { data } = await apiClient.get(`/owner/documents/horse/${horseId}`);
  return data.data ?? [];
}
export {
  fetchHorseDocuments,
  fetchOwnerDocuments,
  fetchOwnerOverview,
  fetchOwnerRaceRegistrations,
  uploadHorseDocument,
  uploadOwnerDocument
};
