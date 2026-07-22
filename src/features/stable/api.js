import { apiClient } from "@/common/lib/apiClient";
import { formatDate } from "@/common/lib/format";
import { usd } from "./format";

/** Unwrap a list payload that may be a bare array or a Spring Page object. */
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

/** "GRADE_1" -> "Grade 1", "EARLY_SPRINTER" -> "Early Sprinter". */
function humanize(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function get(path) {
  const { data } = await apiClient.get(path);
  return data.data;
}

function mapRaceHistory(items) {
  return items.map((item, i) => ({
    id: `rh-${item.raceId}-${i}`,
    date: item.scheduledStartAt ?? "",
    event: item.tournamentName
      ? `${item.raceName} (${item.tournamentName})`
      : item.raceName,
    type: "Race",
    location: item.venue ?? "—",
    position: item.finishPosition,
    earnings: item.prizeEarned,
  }));
}

function joinDetail(parts) {
  return parts.filter(Boolean).join(" · ");
}

function mapPedigree(p) {
  const nodes = [];
  if (p.sire?.name) {
    nodes.push({
      label: "The Sire",
      name: p.sire.name,
      detail: joinDetail([
        p.sire.wins != null ? `${p.sire.wins} Wins` : null,
        p.sire.earnings != null
          ? usd(p.sire.earnings)
          : null,
      ]),
    });
  }
  if (p.dam?.name) {
    nodes.push({
      label: "The Dam",
      name: p.dam.name,
      detail: joinDetail([
        p.dam.wins != null ? `${p.dam.wins} Wins` : null,
        p.dam.note,
      ]),
    });
  }
  if (p.trainer?.name) {
    nodes.push({
      label: "Trainer",
      name: p.trainer.name,
      detail: p.trainer.licenseNo ? `License #${p.trainer.licenseNo}` : "",
    });
  }
  return nodes;
}

function mapMedical(m) {
  const health = m?.healthStatus ?? null;
  return {
    lastVetCheck: m?.lastHealthCheckAt ? formatDate(m.lastHealthCheckAt) : "—",
    vaccinationsUpToDate: health === "HEALTHY",
    recoveryStatus:
      health === "HEALTHY" ? "100% Fit" : health ? humanize(health) : "—",
  };
}

/**
 * Real fetch: a single horse (GET /horses/{id}) + its stats, pedigree,
 * medical status and race history. Returns null when the horse is not found.
 */
export async function fetchHorseProfile(id) {
  const horse = await get(`/horses/${id}`).catch(() => null);
  if (!horse) return null;

  const [stats, pedigree, medical, history] = await Promise.all([
    get(`/horses/${id}/stats`).catch(() => null),
    get(`/horses/${id}/pedigree`).catch(() => null),
    get(`/horses/${id}/medical-status`).catch(() => null),
    get(`/horses/${id}/race-history`)
      .then(toArray)
      .catch(() => []),
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
    // No workouts endpoint and no `horse_workout` table exists, and no component ever rendered
    // this field — so it is an empty list rather than invented rows. Populate it if that table lands.
    workouts: [],
    lifetimeEarnings: stats?.lifetimeEarnings ?? 0,
    starts: stats?.starts ?? 0,
    wins: stats?.wins ?? 0,
    top3: stats?.top3 ?? 0,
    medical: mapMedical(medical),
    characteristics: (stats?.characteristics ?? []).map(humanize),
  };
}

/** Raw single-horse DTO (GET /horses/{id}) — used to prefill the edit form. */
export async function fetchHorse(id) {
  return get(`/horses/${id}`);
}

export function toHorseRequest(v) {
  const blank = (s) => (s.trim() === "" ? undefined : s.trim());
  const w = parseFloat(v.weight);
  return {
    name: v.name.trim(),
    gender: v.gender,
    breed: blank(v.breed),
    color: blank(v.color),
    dateOfBirth: blank(v.dateOfBirth),
    weight: Number.isFinite(w) ? w : undefined,
    originCountry: blank(v.originCountry),
    microchipNo: blank(v.microchipNo),
    healthStatus: blank(v.healthStatus),
    registrationStatus: blank(v.registrationStatus),
    status: blank(v.status),
  };
}

export async function fetchOwnerHorseList() {
  const horses = await get("/owner/horses").then(toArray);
  return horses.map((h) => ({
    id: h.horseId,
    name: h.name,
    horseCode: h.horseCode,
    breed: h.breed ?? "",
    gender: h.gender ? humanize(h.gender) : "",
    imageUrl: h.imageUrl,
    status: h.status ? humanize(h.status) : "Active",
    health: h.healthStatus ? humanize(h.healthStatus) : "",
  }));
}

export async function createHorse(values) {
  const { data } = await apiClient.post("/horses", toHorseRequest(values));
  return data.data;
}

export async function updateHorse(id, values) {
  const { data } = await apiClient.put(
    `/horses/${id}`,
    toHorseRequest(values),
  );
  return data.data;
}

export async function deleteHorse(id) {
  await apiClient.delete(`/horses/${id}`);
}

export async function uploadHorseImage(id, file) {
  const form = new FormData();
  form.append("file", file);
  await apiClient.post(`/horses/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function enterHorseInRace(id, raceId) {
  await apiClient.post(`/horses/${id}/assign-to-race`, { raceId });
}

// ── Medical records ──
export async function fetchMedicalRecords(horseId) {
  const { data } = await apiClient.get(`/horses/${horseId}/medical-records`);
  return Array.isArray(data.data) ? data.data : (data.data.content ?? []);
}
export async function addMedicalRecord(horseId, body) {
  const { data } = await apiClient.post(
    `/horses/${horseId}/medical-records`,
    body,
  );
  return data.data;
}
export async function updateMedicalRecord(horseId, recordId, body) {
  const { data } = await apiClient.put(
    `/horses/${horseId}/medical-records/${recordId}`,
    body,
  );
  return data.data;
}
export async function deleteMedicalRecord(horseId, recordId) {
  await apiClient.delete(`/horses/${horseId}/medical-records/${recordId}`);
}
/** Upload (or replace) the file attached to a medical record; returns the updated record. */
export async function uploadMedicalRecordFile(horseId, recordId, file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post(
    `/horses/${horseId}/medical-records/${recordId}/file`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
}

/** Open races this horse can actually be entered into (has an APPROVED registration, not yet entered). */
export async function fetchEnterableRaces(horseId) {
  const races = await get(`/horses/${horseId}/enterable-races`).then(toArray);
  return races.map((r) => {
    const base = r.tournamentName
      ? `${r.name ?? r.raceCode} — ${r.tournamentName}`
      : (r.name ?? r.raceCode);
    const label =
      r.entryFee != null && r.entryFee > 0
        ? `${base} · Fee ${r.entryFee.toLocaleString("vi-VN")}₫`
        : base;
    return { id: r.raceId, label };
  });
}
