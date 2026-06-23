import api from "./api";

const RACE_ENDPOINT = "/api/v1/races";
const HORSE_ENDPOINT = "/api/v1/horses";
const INVITATION_ENDPOINT = "/api/v1/assignments/invitations";
const REFEREE_ENDPOINT = "/api/v1/referee";

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function listFrom(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.items ?? [];
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
}

function mapInspectionEntry(entry, horse, medical, assignment) {
  const healthStatus =
    medical?.healthStatus || horse?.healthStatus || "UNFIT";
  const lastHealthCheckAt = medical?.lastHealthCheckAt || null;

  return {
    id: entry.entryId,
    entryId: entry.entryId,
    entryCode: entry.entryCode,
    gate: entry.laneNo ?? entry.entryNo ?? "—",
    horseId: entry.horseId,
    horseName: entry.horseName || horse?.name || "Unknown horse",
    jockeyName: assignment?.jockeyName || "Not assigned",
    ownerName: entry.ownerName || horse?.ownerName || "Not provided",
    microchip: horse?.microchipNo || "Not provided by API",
    age: calculateAge(horse?.dateOfBirth),
    gender: horse?.gender || "Not provided",
    breed: horse?.breed || "Not provided",
    weight: horse?.weight ?? null,
    healthStatus,
    lastHealthCheckAt,
    medicalNote: medical?.medicalNote || "",
    healthCert: healthStatus,
    weightStatus: horse?.weight !== null && horse?.weight !== undefined
      ? "RECORDED"
      : "NOT_RECORDED",
    cleared: healthStatus === "HEALTHY" && Boolean(lastHealthCheckAt),
  };
}

export async function getInspectionRoster(params = {}) {
  const raceData = unwrap(
    await api.get(RACE_ENDPOINT, {
      params: {
        page: 0,
        size: 100,
        sortBy: "scheduledStartAt",
        sortDir: "asc",
      },
    }),
  );
  const races = listFrom(raceData).filter((race) =>
    ["SCHEDULED", "OPEN"].includes(race.status),
  );
  const selectedRace =
    races.find((race) => race.raceId === params.raceId) || races[0] || null;

  if (!selectedRace) {
    return { races, race: null, items: [] };
  }

  const [entryResponse, invitationResponse] = await Promise.all([
    api.get(`${RACE_ENDPOINT}/${selectedRace.raceId}/entries`),
    api.get(INVITATION_ENDPOINT, {
      params: {
        status: "ACCEPTED",
        page: 0,
        size: 100,
        sortBy: "respondedAt",
        sortDir: "desc",
      },
    }),
  ]);

  const entries = listFrom(unwrap(entryResponse));
  const assignments = listFrom(unwrap(invitationResponse));
  const assignmentByEntryId = new Map(
    assignments.map((assignment) => [assignment.entryId, assignment]),
  );

  const items = await Promise.all(
    entries.map(async (entry) => {
      const [horseResponse, medicalResponse] = await Promise.all([
        api.get(`${HORSE_ENDPOINT}/${entry.horseId}`),
        api.get(`${HORSE_ENDPOINT}/${entry.horseId}/medical-status`),
      ]);
      return mapInspectionEntry(
        entry,
        unwrap(horseResponse),
        unwrap(medicalResponse),
        assignmentByEntryId.get(entry.entryId),
      );
    }),
  );

  return { races, race: selectedRace, items };
}

export async function getInspectionDetail(horseId) {
  const [horseResponse, medicalResponse] = await Promise.all([
    api.get(`${HORSE_ENDPOINT}/${horseId}`),
    api.get(`${HORSE_ENDPOINT}/${horseId}/medical-status`),
  ]);
  const horse = unwrap(horseResponse);
  const medical = unwrap(medicalResponse);

  return {
    horseId: horse.horseId,
    horseName: horse.name,
    ownerName: horse.ownerName || "Not provided",
    microchip: horse.microchipNo || "Not provided by API",
    age: calculateAge(horse.dateOfBirth),
    gender: horse.gender || "Not provided",
    breed: horse.breed || "Not provided",
    weight: horse.weight ?? null,
    healthStatus: medical?.healthStatus || horse.healthStatus,
    lastHealthCheckAt: medical?.lastHealthCheckAt || null,
    medicalNote: medical?.medicalNote || "",
  };
}

export async function submitHorseHealthCheck(payload) {
  const { horseId, healthStatus, note = "" } = payload;
  const response = await api.post(
    `${REFEREE_ENDPOINT}/horses/${horseId}/health-check`,
    {
      healthStatus,
      note: note.trim() || null,
    },
  );
  return unwrap(response);
}
