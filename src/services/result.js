import api from "./api";

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

export async function getRaceResults(raceId) {
  const response = await api.get(`/api/v1/races/${raceId}/results`);
  return unwrap(response);
}

export async function recordRaceResults(raceId, payload) {
  const response = await api.post(`/api/v1/races/${raceId}/results`, payload);
  return unwrap(response);
}

export async function certifyRaceResults(raceId, payload) {
  const response = await api.patch(`/api/v1/races/${raceId}/results/certify`, payload);
  return unwrap(response);
}

export async function updateRaceResult(raceId, resultId, payload) {
  const response = await api.patch(`/api/v1/races/${raceId}/results/${resultId}`, payload);
  return unwrap(response);
}

export async function getPredictionList(params = {}) {
  try {
    const response = await api.get("/api/v1/predictions", { params: cleanParams(params) });
    return unwrap(response);
  } catch (error) {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || error?.message || "");
    const shouldFallback = [403, 404, 405].includes(status) || message.includes("HttpRequestMethodNotSupportedException");
    if (!shouldFallback) throw error;

    const response = await api.get("/api/v1/predictions/me", { params: cleanParams(params) });
    return unwrap(response);
  }
}
