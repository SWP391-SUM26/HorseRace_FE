import api from './api';

const ENDPOINT = '/api/v1/predictions';

export async function createPrediction(data) {
  const response = await api.post(ENDPOINT, data);
  return response.data;
}

export async function getPredictions(params = {}) {
  const response = await api.get(ENDPOINT, { params });
  return response.data;
}

export async function getMyPredictions(params = {}) {
  const response = await api.get(`${ENDPOINT}/me`, { params });
  return response.data;
}

export async function getMyPredictionDetail(id) {
  const response = await api.get(`${ENDPOINT}/me/${id}`);
  return response.data;
}

export async function cancelPrediction(id) {
  const response = await api.post(`${ENDPOINT}/me/${id}/cancel`);
  return response.data;
}
