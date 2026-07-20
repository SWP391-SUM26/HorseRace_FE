import { apiClient } from "@/common/lib/apiClient";
import { formatDate } from "@/common/lib/format";
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}
function humanize(value) {
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
async function get(path) {
  const { data } = await apiClient.get(path);
  return data.data;
}
function mapRaceHistory(items) {
  return items.map((item, i) => ({
    id: `rh-${item.raceId}-${i}`,
    date: item.scheduledStartAt ?? "",
    event: item.tournamentName ? `${item.raceName} (${item.tournamentName})` : item.raceName,
    type: "Race",
    location: item.venue ?? "\u2014",
    position: item.finishPosition,
    earnings: item.prizeEarned
  }));
}
function joinDetail(parts) {
  return parts.filter(Boolean).join(" \xB7 ");
}
function mapPedigree(p) {
  const nodes = [];
  if (p.sire?.name) {
    nodes.push({
      label: "The Sire",
      name: p.sire.name,
      detail: joinDetail([
        p.sire.wins != null ? `${p.sire.wins} Wins` : null,
        p.sire.earnings != null ? `$${p.sire.earnings.toLocaleString()}` : null
      ])
    });
  }
  if (p.dam?.name) {
    nodes.push({
      label: "The Dam",
      name: p.dam.name,
      detail: joinDetail([p.dam.wins != null ? `${p.dam.wins} Wins` : null, p.dam.note])
    });
  }
  if (p.trainer?.name) {
    nodes.push({
      label: "Trainer",
      name: p.trainer.name,
      detail: p.trainer.licenseNo ? `License #${p.trainer.licenseNo}` : ""
    });
  }
  return nodes;
}
function mapMedical(m) {
  const health = m?.healthStatus ?? null;
  return {
    lastVetCheck: m?.lastHealthCheckAt ? formatDate(m.lastHealthCheckAt) : "\u2014",
    vaccinationsUpToDate: health === "HEALTHY",
    recoveryStatus: health === "HEALTHY" ? "100% Fit" : health ? humanize(health) : "\u2014"
  };
}
async function fetchHorseProfile(id) {
  const horse = await get(`/horses/${id}`).catch(() => null);
  if (!horse) return null;
  const [stats, pedigree, medical, history] = await Promise.all([
    get(`/horses/${id}/stats`).catch(() => null),
    get(`/horses/${id}/pedigree`).catch(() => null),
    get(`/horses/${id}/medical-status`).catch(() => null),
    get(`/horses/${id}/race-history`).then(toArray).catch(() => [])
  ]);
  return {
    id: horse.horseCode,
    name: horse.name,
    horseCode: horse.horseCode,
    breed: horse.breed ?? "",
    gender: horse.gender ? humanize(horse.gender) : "",
    imageUrl: horse.imageUrl,
    status: horse.status ? humanize(horse.status) : "Active",
    grade: stats?.grade ? humanize(stats.grade) : "",
    pedigree: pedigree ? mapPedigree(pedigree) : [],
    raceHistory: mapRaceHistory(history),
    workouts: [],
    lifetimeEarnings: stats?.lifetimeEarnings ?? 0,
    starts: stats?.starts ?? 0,
    wins: stats?.wins ?? 0,
    top3: stats?.top3 ?? 0,
    medical: mapMedical(medical),
    characteristics: (stats?.characteristics ?? []).map(humanize)
  };
}
async function fetchHorse(id) {
  return get(`/horses/${id}`);
}
function toHorseRequest(v) {
  const blank = (s) => s.trim() === "" ? void 0 : s.trim();
  const w = parseFloat(v.weight);
  return {
    name: v.name.trim(),
    gender: v.gender,
    breed: blank(v.breed),
    color: blank(v.color),
    dateOfBirth: blank(v.dateOfBirth),
    weight: Number.isFinite(w) ? w : void 0,
    originCountry: blank(v.originCountry),
    microchipNo: blank(v.microchipNo),
    healthStatus: blank(v.healthStatus),
    registrationStatus: blank(v.registrationStatus),
    status: blank(v.status)
  };
}
async function fetchOwnerHorseList() {
  const horses = await get("/owner/horses").then(toArray);
  return horses.map((h) => ({
    id: h.horseId,
    name: h.name,
    horseCode: h.horseCode,
    breed: h.breed ?? "",
    gender: h.gender ? humanize(h.gender) : "",
    imageUrl: h.imageUrl,
    status: h.status ? humanize(h.status) : "Active",
    health: h.healthStatus ? humanize(h.healthStatus) : ""
  }));
}
async function createHorse(values) {
  const { data } = await apiClient.post("/horses", toHorseRequest(values));
  return data.data;
}
async function updateHorse(id, values) {
  const { data } = await apiClient.put(`/horses/${id}`, toHorseRequest(values));
  return data.data;
}
async function deleteHorse(id) {
  await apiClient.delete(`/horses/${id}`);
}
async function uploadHorseImage(id, file) {
  const form = new FormData();
  form.append("file", file);
  await apiClient.post(`/horses/${id}/image`, form, { headers: { "Content-Type": "multipart/form-data" } });
}
async function enterHorseInRace(id, raceId) {
  await apiClient.post(`/horses/${id}/assign-to-race`, { raceId });
}
async function fetchMedicalRecords(horseId) {
  const { data } = await apiClient.get(`/horses/${horseId}/medical-records`);
  return Array.isArray(data.data) ? data.data : data.data.content ?? [];
}
async function addMedicalRecord(horseId, body) {
  const { data } = await apiClient.post(`/horses/${horseId}/medical-records`, body);
  return data.data;
}
async function updateMedicalRecord(horseId, recordId, body) {
  const { data } = await apiClient.put(`/horses/${horseId}/medical-records/${recordId}`, body);
  return data.data;
}
async function deleteMedicalRecord(horseId, recordId) {
  await apiClient.delete(`/horses/${horseId}/medical-records/${recordId}`);
}
async function uploadMedicalRecordFile(horseId, recordId, file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(`/horses/${horseId}/medical-records/${recordId}/file`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.data;
}
async function fetchEnterableRaces(horseId) {
  const races = await get(
    `/horses/${horseId}/enterable-races`
  ).then(toArray);
  return races.map((r) => {
    const base = r.tournamentName ? `${r.name ?? r.raceCode} \u2014 ${r.tournamentName}` : r.name ?? r.raceCode;
    const label = r.entryFee != null && r.entryFee > 0 ? `${base} \xB7 Fee ${r.entryFee.toLocaleString("vi-VN")}\u20AB` : base;
    return { id: r.raceId, label };
  });
}
export {
  addMedicalRecord,
  createHorse,
  deleteHorse,
  deleteMedicalRecord,
  enterHorseInRace,
  fetchEnterableRaces,
  fetchHorse,
  fetchHorseProfile,
  fetchMedicalRecords,
  fetchOwnerHorseList,
  toHorseRequest,
  updateHorse,
  updateMedicalRecord,
  uploadHorseImage,
  uploadMedicalRecordFile
};
