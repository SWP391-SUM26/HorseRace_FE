import api from './api';

const ENDPOINT = '/api/v1/registrations';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function ensureApiData(data) {
  if (typeof data === 'string' || data === null || data === undefined) {
    throw new Error('Registration API returned an invalid response.');
  }
  return data;
}

function mapRegistrationToUI(item) {
  if (!item) return null;
  return {
    ...item,
    id: item.registrationId || item.id,
    code: item.registrationCode || 'N/A',
    status: item.status,
    submittedAt: item.submittedAt,
    reviewedAt: item.reviewedAt,
    rejectionReason: item.rejectionReason,
    refereeNotes: item.refereeNotes || '',
    horse: item.horse || {
      id: item.horseId || 'N/A',
      name: item.horseName || 'Unknown',
      code: item.horseCode || 'N/A',
      image: item.horseImage || '/src/assets/silver_streak.png',
      age: item.horseAge || 0,
      stable: 'N/A',
      breed: 'Thoroughbred',
      sire: 'N/A',
      dam: 'N/A',
    },
    owner: item.owner || {
      id: item.ownerUserId || 'N/A',
      name: item.ownerName || 'Unknown',
    },
    tournament: item.tournament || {
      id: item.tournamentId || 'N/A',
      name: item.tournamentName || 'Unknown',
    },
    eligibility: item.eligibility || {
      vaccinationRecords: 'VALID',
      fitnessCertification: 'VALID',
      passportScan: 'VALID',
      weightVerification: 'VALID',
      medicalExamination: 'VALID',
    },
  };
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
    items: items.map(mapRegistrationToUI),
    page,
    pageSize,
    totalItems,
    totalPages: Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

export function submitRegistration(payload) {
  return api.post(ENDPOINT, payload).then((response) => ensureApiData(unwrap(response)));
}

export function getRegistrationList(params = {}) {
  const apiParams = { ...params };
  if (apiParams.page) {
    apiParams.page = Math.max(0, apiParams.page - 1);
  }
  if (apiParams.pageSize) {
    apiParams.size = apiParams.pageSize;
    delete apiParams.pageSize;
  }
  if (apiParams.search !== undefined) {
    apiParams.q = apiParams.search;
    delete apiParams.search;
  }
  Object.keys(apiParams).forEach((key) => {
    if (apiParams[key] === '' || apiParams[key] === null) {
      delete apiParams[key];
    }
  });

  return api.get(ENDPOINT, { params: apiParams }).then((response) =>
    normalizeList(ensureApiData(unwrap(response)), params),
  );
}

export function getRegistrationDetail(id) {
  return api.get(`${ENDPOINT}/${id}`).then((response) =>
    mapRegistrationToUI(ensureApiData(unwrap(response))),
  );
}

export function approveRegistration(id) {
  return api.patch(`${ENDPOINT}/${id}/approve`).then((response) =>
    ensureApiData(unwrap(response)),
  );
}

export function rejectRegistration(id, payload) {
  return api.patch(`${ENDPOINT}/${id}/reject`, { reason: payload.reason }).then(
    (response) => ensureApiData(unwrap(response)),
  );
}
