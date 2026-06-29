import api from "./api";

const ENDPOINT = "/api/v1/races";

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

function toApiParams(params = {}) {
  const sortMap = {
    date: "scheduledStartAt",
    scheduledStartAt: "scheduledStartAt",
    name: "name",
    createdAt: "createdAt",
  };

  return cleanParams({
    q: params.search,
    tournamentId: params.tournamentId,
    status: params.status,
    sortBy: sortMap[params.sortBy] || params.sortBy || "scheduledStartAt",
    sortDir: params.sortOrder || params.sortDir || "asc",
    page: Math.max(0, Number(params.page || 1) - 1),
    size: params.pageSize || params.size || 5,
  });
}

function toDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function toTime(value) {
  if (!value) return "";
  return String(value).slice(11, 16);
}

function toOffsetDateTime(date, time) {
  if (!date) return null;
  const safeTime = time || "00:00";
  return new Date(`${date}T${safeTime}:00`).toISOString();
}

function normalizeOffsetDateTime(value) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

function mapRaceToUI(race) {
  if (!race) return null;

  const scheduledStartAt = race.scheduledStartAt || race.dateTime || null;
  const maxParticipants =
    race.maxParticipants === null || race.maxParticipants === undefined
      ? null
      : Number(race.maxParticipants);
  const participantIds = race.participantIds || race.entries?.map((entry) => entry.registrationId) || [];

  return {
    ...race,
    id: race.raceId || race.id,
    raceId: race.raceId || race.id,
    raceCode: race.raceCode || race.code || "N/A",
    tournamentId: race.tournamentId || "",
    tournamentName: race.tournamentName || "Unknown Tournament",
    date: toDate(scheduledStartAt),
    time: toTime(scheduledStartAt),
    scheduledStartAt,
    predictionCutoffAt: race.predictionCutoffAt || null,
    participantIds,
    maxParticipants,
  };
}

function normalizeList(data, params = {}) {
  const rawItems = Array.isArray(data)
    ? data
    : data?.items ?? data?.content ?? data?.races ?? [];
  const items = rawItems.map(mapRaceToUI).filter(Boolean);
  const pageSize = Number(data?.pageSize ?? data?.size ?? params.pageSize) || 5;
  const totalItems =
    Number(data?.totalItems ?? data?.totalElements ?? data?.total) || items.length;
  const totalPages = Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize));
  const rawPage =
    Number(data?.page ?? (data?.number !== undefined ? data.number + 1 : params.page)) ||
    1;
  const page = Math.min(Math.max(rawPage, 1), totalPages);

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

function toRacePayload(payload = {}) {
  return cleanParams({
    tournamentId: payload.tournamentId,
    name: payload.name?.trim(),
    raceType: payload.raceType?.trim(),
    distanceMeter: payload.distanceMeter ? Number(payload.distanceMeter) : undefined,
    trackCondition: payload.trackCondition?.trim(),
    weatherCondition: payload.weatherCondition?.trim(),
    scheduledStartAt: payload.scheduledStartAt || toOffsetDateTime(payload.date, payload.time),
    predictionCutoffAt: normalizeOffsetDateTime(payload.predictionCutoffAt),
    maxParticipants: payload.maxParticipants ? Number(payload.maxParticipants) : undefined,
  });
}

function toSchedulePayload(payload = {}) {
  const scheduledStartAt =
    payload.scheduledStartAt || toOffsetDateTime(payload.date, payload.time);

  return cleanParams({
    scheduledStartAt,
    predictionCutoffAt: normalizeOffsetDateTime(payload.predictionCutoffAt),
  });
}

export function getRaceList(params = {}) {
  return api
    .get(ENDPOINT, { params: toApiParams(params) })
    .then((response) => normalizeList(unwrap(response), params));
}

export function getRaceDetail(id) {
  return api
    .get(`${ENDPOINT}/${id}`)
    .then((response) => mapRaceToUI(unwrap(response)));
}

export function createRace(payload) {
  return api
    .post(ENDPOINT, toRacePayload(payload))
    .then((response) => mapRaceToUI(unwrap(response)));
}

export function updateRace(id, payload) {
  return api
    .put(`${ENDPOINT}/${id}`, toRacePayload(payload))
    .then((response) => mapRaceToUI(unwrap(response)));
}

export function deleteRace(id) {
  return api.delete(`${ENDPOINT}/${id}`).then((response) => unwrap(response));
}

export function scheduleRace(id, payload) {
  return api
    .patch(`${ENDPOINT}/${id}/schedule`, toSchedulePayload(payload))
    .then((response) => mapRaceToUI(unwrap(response)));
}

export function cancelRace(id) {
  return api
    .patch(`${ENDPOINT}/${id}/cancel`)
    .then((response) => mapRaceToUI(unwrap(response)));
}

export function getRaceEntries(id) {
  return api.get(`${ENDPOINT}/${id}/entries`).then((response) => unwrap(response));
} 

export async function assignParticipants(id, payload = {}) {
  const registrationIds = payload.registrationIds || payload.participantIds || [];
  const requests = registrationIds.map((registrationId, index) =>
    api.post(`${ENDPOINT}/${id}/entries`, {
      registrationId,
      entryNo: index + 1,
      laneNo: index + 1,
    }),
  );

  return Promise.all(requests).then((responses) => responses.map(unwrap));
}

export function getMyEntry(raceId) {
  return api.get(`${ENDPOINT}/${raceId}/my-entry`).then((response) => unwrap(response));
}

export function getJockeySuggestions(raceId, horseId) {
  return api.get(`${ENDPOINT}/${raceId}/jockey-suggestions?horseId=${horseId}`).then((response) => unwrap(response));
}
