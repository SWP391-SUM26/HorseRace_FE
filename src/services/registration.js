import api from './api';
import registrationMock from '../data/registrationMock.json';

const ENDPOINT = '/registrations';
const STORAGE_KEY = 'equine_elite_registrations';
const HAS_API_BASE_URL = Boolean(import.meta.env.VITE_API_URL?.trim());

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function ensureApiData(data) {
  if (typeof data === 'string' || data === null || data === undefined) {
    throw new Error('Registration API returned an invalid response.');
  }
  return data;
}

function canFallback(error) {
  return !error.response || [404, 405, 501].includes(error.response.status);
}

function readRegistrations() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationMock.registrations));
    return [...registrationMock.registrations];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationMock.registrations));
    return [...registrationMock.registrations];
  }
}

function writeRegistrations(registrations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

async function apiOrFallback(request, fallback) {
  if (!HAS_API_BASE_URL) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    if (!canFallback(error)) throw error;
    console.warn('Registration API unavailable. Using local fallback data.');
    return fallback();
  }
}

function normalizeList(data, params) {
  const items = Array.isArray(data)
    ? data
    : data?.items ?? data?.content ?? data?.registrations ?? [];
  const pageSize = Number(data?.pageSize ?? data?.size ?? params.pageSize) || 5;
  const totalItems =
    Number(data?.totalItems ?? data?.totalElements ?? data?.total) || items.length;
  const page =
    Number(data?.page ?? (data?.number !== undefined ? data.number + 1 : params.page)) ||
    1;

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

function getMockList(params = {}) {
  const {
    search = '',
    tournamentId = '',
    raceId = '',
    status = '',
    page = 1,
    pageSize = 5,
  } = params;
  const query = search.trim().toLowerCase();
  const filtered = readRegistrations()
    .filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.horse.name.toLowerCase().includes(query) ||
        item.owner.name.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (!tournamentId || item.tournament.id === tournamentId) &&
        (!raceId || item.race.id === raceId) &&
        (!status || item.status === status)
      );
    })
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));

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

function updateMock(id, changes) {
  let updated = null;
  writeRegistrations(
    readRegistrations().map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...changes };
      return updated;
    }),
  );
  return updated;
}

export function submitRegistration(payload) {
  return apiOrFallback(
    async () => ensureApiData(unwrap(await api.post(ENDPOINT, payload))),
    () => {
      const registration = {
        id: `REG-${Date.now()}`,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        refereeNotes: '',
        ...payload,
      };
      writeRegistrations([registration, ...readRegistrations()]);
      return registration;
    },
  );
}

export function getRegistrationList(params = {}) {
  return apiOrFallback(
    async () =>
      normalizeList(
        ensureApiData(unwrap(await api.get(ENDPOINT, { params }))),
        params,
      ),
    () => getMockList(params),
  );
}

export function getRegistrationDetail(id) {
  return apiOrFallback(
    async () => ensureApiData(unwrap(await api.get(`${ENDPOINT}/${id}`))),
    () => readRegistrations().find((item) => item.id === id) || null,
  );
}

export function approveRegistration(id, payload = {}) {
  return apiOrFallback(
    async () =>
      ensureApiData(unwrap(await api.patch(`${ENDPOINT}/${id}/approve`, payload))),
    () =>
      updateMock(id, {
        status: 'APPROVED',
        refereeNotes: payload.notes || '',
        reviewedAt: new Date().toISOString(),
      }),
  );
}

export function rejectRegistration(id, payload) {
  return apiOrFallback(
    async () =>
      ensureApiData(unwrap(await api.patch(`${ENDPOINT}/${id}/reject`, payload))),
    () =>
      updateMock(id, {
        status: 'REJECTED',
        refereeNotes: payload.notes || '',
        rejectionReason: payload.reason,
        reviewedAt: new Date().toISOString(),
      }),
  );
}
