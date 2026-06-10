import api from './api';

const TOURNAMENT_ENDPOINT = '/api/v1/tournaments';

export const getTournaments = async (params = {}) => {
  const response = await api.get(TOURNAMENT_ENDPOINT, { params });
  return response.data;
};

export const getTournamentById = async (id) => {
  const response = await api.get(`${TOURNAMENT_ENDPOINT}/${id}`);
  return response.data;
};

export const createTournament = async (data) => {
  const response = await api.post(TOURNAMENT_ENDPOINT, data);
  return response.data;
};

export const updateTournament = async (id, data) => {
  const response = await api.put(`${TOURNAMENT_ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteTournament = async (id) => {
  const response = await api.delete(`${TOURNAMENT_ENDPOINT}/${id}`);
  return response.data;
};

export const publishTournament = async (id) => {
  const response = await api.patch(`${TOURNAMENT_ENDPOINT}/${id}/publish`);
  return response.data;
};

export const closeRegistration = async (id) => {
  const response = await api.patch(`${TOURNAMENT_ENDPOINT}/${id}/close-registration`);
  return response.data;
};
