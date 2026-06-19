import api from './api';

const ENDPOINT = '/api/v1/admin/approvals/users';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function ensureApiData(data) {
  if (typeof data === 'string' || data === null || data === undefined) {
    throw new Error('API returned an invalid response.');
  }
  return data;
}

export function getPendingUsers(params) {
  // Default status to PENDING if not provided
  const apiParams = {
    ...params,
    kycStatus: params?.kycStatus || 'PENDING',
  };

  return api.get(ENDPOINT, { params: apiParams }).then((response) => {
    const data = ensureApiData(unwrap(response));
    return {
      items: Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [],
      totalItems: data?.totalElements || 0,
      totalPages: data?.totalPages || 1,
    };
  });
}

export function getUserApprovalDetail(id) {
  return api.get(`${ENDPOINT}/${id}`).then((response) =>
    ensureApiData(unwrap(response)),
  );
}

export function approveUserKyc(id) {
  return api.patch(`${ENDPOINT}/${id}/approve`).then((response) =>
    ensureApiData(unwrap(response)),
  );
}

export function rejectUserKyc(id, payload) {
  return api.patch(`${ENDPOINT}/${id}/reject`, { reason: payload.reason }).then(
    (response) => ensureApiData(unwrap(response)),
  );
}
