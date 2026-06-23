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

function normalizePage(data, params = {}) {
  const items = listFrom(data);
  const size = Number(data?.size ?? params.pageSize ?? 10);
  const page = Number(data?.number ?? 0) + 1;
  const totalItems = Number(data?.totalElements ?? items.length);
  return {
    items,
    page,
    pageSize: size,
    totalItems,
    totalPages: Number(data?.totalPages ?? Math.max(1, Math.ceil(totalItems / size))),
  };
}

async function getRaceCatalog(params = {}) {
  const data = unwrap(
    await api.get(RACE_ENDPOINT, {
      params: {
        status: params.status || undefined,
        page: 0,
        size: params.size || 100,
        sortBy: params.sortBy || "scheduledStartAt",
        sortDir: params.sortDir || "desc",
      },
    }),
  );
  return listFrom(data);
}

async function enrichReportsWithRaces(reports) {
  const raceIds = [...new Set(reports.map((report) => report.raceId).filter(Boolean))];
  const races = await Promise.all(
    raceIds.map((raceId) =>
      api.get(`${RACE_ENDPOINT}/${raceId}`).then(unwrap),
    ),
  );
  const raceById = new Map(races.map((race) => [race.raceId, race]));
  return reports.map((report) => ({
    ...report,
    id: report.reportId,
    status: report.reportStatus,
    race: raceById.get(report.raceId) || null,
  }));
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
    gate: entry.laneNo ?? entry.entryNo ?? "-",
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

// Helpers for Race & Reports
export async function getRaceCatalog(params = {}) {
  const data = unwrap(
    await api.get(RACE_ENDPOINT, {
      params: {
        page: 0,
        size: 100,
        ...params,
      },
    }),
  );
  return listFrom(data);
}

export async function enrichReportsWithRaces(reports) {
  const raceIds = [...new Set(reports.map((r) => r.raceId).filter(Boolean))];
  const raceMap = new Map();
  await Promise.all(
    raceIds.map(async (id) => {
      try {
        const race = unwrap(await api.get(`${RACE_ENDPOINT}/${id}`));
        raceMap.set(id, race);
      } catch (err) {
        console.warn(`Could not fetch race ${id}`);
      }
    }),
  );
  return reports.map((report) => ({
    ...report,
    race: raceMap.get(report.raceId) || null,
  }));
}

function normalizePage(data, params) {
  const items = listFrom(data);
  const totalItems = data?.totalElements ?? items.length;
  const pageSize = Number(params.pageSize) || 10;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  return { items, totalPages };
}

export async function getInspectionRoster(params = {}) {
  const races = await getRaceCatalog({
    sortBy: "scheduledStartAt",
    sortDir: "asc",
  });
  const filteredRaces = races.filter((race) =>
    ["SCHEDULED", "OPEN"].includes(race.status),
  );
  const selectedRace =
    filteredRaces.find((race) => race.raceId === params.raceId) || filteredRaces[0] || null;

  if (!selectedRace) {
    return { races: filteredRaces, race: null, items: [] };
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

  return { races: filteredRaces, race: selectedRace, items };
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


// ==========================================
// Added from HEAD for Reports (Our Changes)
// ==========================================
export const recordHealthCheck = async (horseId, data) => {
  try {
    const response = await api.post(`/api/v1/referee/horses/${horseId}/health-check`, data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('API recordHealthCheck failed:', error.message);
    throw error;
  }
};

export const getReports = async (filter = {}) => {
  try {
    const params = new URLSearchParams();
    if (filter.raceId) params.append('raceId', filter.raceId);
    if (filter.reportType) params.append('reportType', filter.reportType);
    if (filter.status) params.append('status', filter.status);

    const response = await api.get(`/api/v1/referee/reports`, { params });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('API getReports failed:', error.message);
    throw error;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await api.get(`/api/v1/referee/reports/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`API getReportById (${id}) failed:`, error.message);
    throw error;
  }
};

export const createReport = async (data) => {
  try {
    const response = await api.post(`/api/v1/referee/reports`, data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('API createReport failed:', error.message);
    throw error;
  }
};

export const submitReport = async (id) => {
  try {
    const response = await api.put(`/api/v1/referee/reports/${id}/submit`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`API submitReport (${id}) failed:`, error.message);
    throw error;
  }
};

// ==========================================
// Appended from develop (Missing functions)
// ==========================================

export async function getLiveRaceMonitor(params = {}) {
  const races = await getRaceCatalog({
    status: "RUNNING",
    sortBy: "actualStartAt",
    sortDir: "desc",
  });
  const selectedRace =
    races.find((race) => race.raceId === params.raceId) || races[0] || null;
  if (!selectedRace) return { races, race: null, entries: [], incidents: [] };
  return getRaceLiveDetail(selectedRace.raceId).then((detail) => ({
    races,
    ...detail,
  }));
}

export async function getRaceLiveDetail(raceId) {
  const [raceResponse, entriesResponse, reportsResponse, assignmentsResponse] =
    await Promise.all([
      api.get(`${RACE_ENDPOINT}/${raceId}`),
      api.get(`${RACE_ENDPOINT}/${raceId}/entries`),
      api.get(`${REFEREE_ENDPOINT}/reports`, {
        params: {
          raceId,
          page: 0,
          size: 100,
          sortBy: "createdAt",
          sortDir: "desc",
        },
      }),
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
  const race = unwrap(raceResponse);
  const assignments = listFrom(unwrap(assignmentsResponse));
  const jockeyByEntry = new Map(
    assignments.map((assignment) => [assignment.entryId, assignment.jockeyName]),
  );
  const entries = listFrom(unwrap(entriesResponse)).map((entry) => ({
    ...entry,
    jockeyName: jockeyByEntry.get(entry.entryId) || "Not assigned",
  }));
  return {
    race,
    entries,
    incidents: listFrom(unwrap(reportsResponse)),
  };
}

export async function createViolationReport(payload) {
  return unwrap(
    await api.post(`${REFEREE_ENDPOINT}/reports`, {
      raceId: payload.raceId,
      reportType: "VIOLATION",
      summary: payload.summary?.trim() || null,
      decision: payload.decision?.trim() || null,
      severityLevel: payload.severityLevel,
    }),
  );
}

export async function getViolationList(params = {}) {
  const data = unwrap(
    await api.get(`${REFEREE_ENDPOINT}/reports`, {
      params: {
        raceId: params.raceId || undefined,
        reportType: "VIOLATION",
        status: params.status || undefined,
        page: Math.max((Number(params.page) || 1) - 1, 0),
        size: params.pageSize || 10,
        sortBy: params.sortBy || "createdAt",
        sortDir: params.sortOrder || "desc",
      },
    }),
  );
  const result = normalizePage(data, params);
  const enriched = await enrichReportsWithRaces(result.items);
  const search = params.search?.trim().toLowerCase();
  return {
    ...result,
    items: search
      ? enriched.filter(
          (item) =>
            item.reportId?.toLowerCase().includes(search) ||
            item.summary?.toLowerCase().includes(search) ||
            item.race?.name?.toLowerCase().includes(search),
        )
      : enriched,
  };
}

export async function getViolationDetail(id) {
  const result = await getViolationList({ page: 1, pageSize: 100 });
  return result.items.find((item) => item.reportId === id) || null;
}

export async function updateViolationReport(id, payload) {
  return unwrap(
    await api.put(`${REFEREE_ENDPOINT}/reports/${id}`, {
      reportType: "VIOLATION",
      summary: payload.summary?.trim() || null,
      decision: payload.decision?.trim() || null,
      severityLevel: payload.severityLevel,
    }),
  );
}

export async function getRaceResultDetail(raceId) {
  const [raceResponse, entriesResponse] = await Promise.all([
    api.get(`${RACE_ENDPOINT}/${raceId}`),
    api.get(`${RACE_ENDPOINT}/${raceId}/entries`),
  ]);
  return {
    race: unwrap(raceResponse),
    entries: listFrom(unwrap(entriesResponse)),
    resultRecordingSupported: false,
  };
}

export async function getFinishedRaceList() {
  const [finished, official] = await Promise.all([
    getRaceCatalog({ status: "FINISHED" }),
    getRaceCatalog({ status: "OFFICIAL" }),
  ]);
  return [...finished, ...official];
}

export async function recordRaceResult() {
  throw new Error(
    "Race result recording is unavailable because Swagger exposes no race-result endpoint.",
  );
}

export async function getOfficialReportList(params = {}) {
  const data = unwrap(
    await api.get(`${REFEREE_ENDPOINT}/reports`, {
      params: {
        raceId: params.raceId || undefined,
        reportType: "GENERAL",
        status: params.status || undefined,
        page: Math.max((Number(params.page) || 1) - 1, 0),
        size: params.pageSize || 20,
        sortBy: "createdAt",
        sortDir: "desc",
      },
    }),
  );
  const result = normalizePage(data, params);
  return {
    ...result,
    items: await enrichReportsWithRaces(result.items),
  };
}

export async function getOfficialRaceCertification(raceId) {
  if (!raceId) return { race: null, entries: [] };
  const [raceResponse, entriesResponse] = await Promise.all([
    api.get(`${RACE_ENDPOINT}/${raceId}`),
    api.get(`${RACE_ENDPOINT}/${raceId}/entries`),
  ]);

  return {
    race: unwrap(raceResponse),
    entries: listFrom(unwrap(entriesResponse)),
  };
}

export async function submitOfficialReport(payload) {
  let reportId = payload.reportId;
  if (!reportId) {
    const created = unwrap(
      await api.post(`${REFEREE_ENDPOINT}/reports`, {
        raceId: payload.raceId,
        reportType: "GENERAL",
        summary: payload.summary?.trim() || null,
        decision: payload.decision?.trim() || null,
        severityLevel: payload.severityLevel || "LOW",
      }),
    );
    reportId = created.reportId;
  } else {
    await api.put(`${REFEREE_ENDPOINT}/reports/${reportId}`, {
      reportType: "GENERAL",
      summary: payload.summary?.trim() || null,
      decision: payload.decision?.trim() || null,
      severityLevel: payload.severityLevel || "LOW",
    });
  }
  return unwrap(
    await api.patch(`${REFEREE_ENDPOINT}/reports/${reportId}/submit`),
  );
}
