import api from "./api";
import raceMock from "../data/raceMock.json";

const ENDPOINT = "/api/v1/races";
const STORAGE_KEY = "equine_elite_races";

function readRaces() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raceMock.races));
    return [...raceMock.races];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raceMock.races));
    return [...raceMock.races];
  }
}

function writeRaces(races) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(races));
}

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function canFallback(error) {
  if (!error.response || [404, 405, 501].includes(error.response.status)) {
    return true;
  }

  const message = String(
    error.response.data?.message || error.response.data?.error || "",
  ).toLowerCase();

  return (
    error.response.status === 500 &&
    (message.includes("noresourcefoundexception") ||
      message.includes("no static resource api/v1/races"))
  );
}

function tournamentName(tournamentId) {
  return (
    raceMock.tournaments.find((item) => item.id === tournamentId)?.name ||
    "Unknown Tournament"
  );
}

function filterMockRaces(params = {}) {
  const {
    search = "",
    tournamentId = "",
    status = "",
    dateFrom = "",
    dateTo = "",
    sortBy = "date",
    sortOrder = "asc",
    page = 1,
    pageSize = 5,
  } = params;
  const query = search.trim().toLowerCase();

  const filtered = readRaces()
    .filter((race) => {
      const matchesSearch =
        !query ||
        race.name.toLowerCase().includes(query) ||
        race.raceCode.toLowerCase().includes(query) ||
        race.track.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (!tournamentId || race.tournamentId === tournamentId) &&
        (!status || race.status === status) &&
        (!dateFrom || race.date >= dateFrom) &&
        (!dateTo || race.date <= dateTo)
      );
    })
    .sort((left, right) => {
      const direction = sortOrder === "desc" ? -1 : 1;
      const leftValue = left[sortBy] ?? "";
      const rightValue = right[sortBy] ?? "";
      return String(leftValue).localeCompare(String(rightValue)) * direction;
    });

  const size = Number(pageSize) || 5;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (currentPage - 1) * size;

  return {
    items: filtered.slice(start, start + size),
    page: currentPage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

function normalizeList(data, params) {
  if (Array.isArray(data)) {
    return {
      items: data,
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || data.length || 5,
      totalItems: data.length,
      totalPages: 1,
    };
  }

  const items = data?.items ?? data?.content ?? data?.races ?? [];
  const page =
    Number(data?.page ?? (data?.number !== undefined ? data.number + 1 : params.page)) ||
    1;
  const pageSize = Number(data?.pageSize ?? data?.size ?? params.pageSize) || 5;
  const totalItems =
    Number(data?.totalItems ?? data?.totalElements ?? data?.total) || items.length;
  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

async function apiOrFallback(request, fallback) {
  try {
    return await request();
  } catch (error) {
    if (!canFallback(error)) throw error;
    console.warn("Race API unavailable. Using local fallback data.");
    return fallback();
  }
}

export function getRaceList(params = {}) {
  return apiOrFallback(
    async () => normalizeList(unwrap(await api.get(ENDPOINT, { params })), params),
    () => filterMockRaces(params),
  );
}

export function getRaceDetail(id) {
  return apiOrFallback(
    async () => unwrap(await api.get(`${ENDPOINT}/${id}`)),
    () => readRaces().find((race) => race.id === id) || null,
  );
}

export function createRace(payload) {
  return apiOrFallback(
    async () => unwrap(await api.post(ENDPOINT, payload)),
    () => {
      const race = {
        id: `race_${Date.now()}`,
        participantIds: [],
        status: "DRAFT",
        ...payload,
        tournamentName: tournamentName(payload.tournamentId),
      };
      writeRaces([race, ...readRaces()]);
      return race;
    },
  );
}

export function updateRace(id, payload) {
  return apiOrFallback(
    async () => unwrap(await api.put(`${ENDPOINT}/${id}`, payload)),
    () => {
      let updated = null;
      writeRaces(
        readRaces().map((race) => {
          if (race.id !== id) return race;
          updated = {
            ...race,
            ...payload,
            tournamentName: payload.tournamentId
              ? tournamentName(payload.tournamentId)
              : race.tournamentName,
          };
          return updated;
        }),
      );
      return updated;
    },
  );
}

export function deleteRace(id) {
  return apiOrFallback(
    async () => unwrap(await api.delete(`${ENDPOINT}/${id}`)),
    () => {
      writeRaces(readRaces().filter((race) => race.id !== id));
      return true;
    },
  );
}

export function scheduleRace(id, payload) {
  return apiOrFallback(
    async () => unwrap(await api.patch(`${ENDPOINT}/${id}/schedule`, payload)),
    () => updateLocalRace(id, { ...payload, status: "SCHEDULED" }),
  );
}

export function cancelRace(id, payload) {
  return apiOrFallback(
    async () => unwrap(await api.patch(`${ENDPOINT}/${id}/cancel`, payload)),
    () =>
      updateLocalRace(id, {
        status: "CANCELLED",
        cancelReason: payload.reason,
      }),
  );
}

export function assignParticipants(id, payload) {
  return apiOrFallback(
    async () => unwrap(await api.put(`${ENDPOINT}/${id}/participants`, payload)),
    () => updateLocalRace(id, { participantIds: payload.participantIds || [] }),
  );
}

function updateLocalRace(id, changes) {
  let updated = null;
  writeRaces(
    readRaces().map((race) => {
      if (race.id !== id) return race;
      updated = { ...race, ...changes };
      return updated;
    }),
  );
  return updated;
}
