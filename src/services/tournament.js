import api from './api';

const TOURNAMENT_ENDPOINT = '/v1/tournaments';

// Lọc payload cho đúng với TournamentRequest DTO BE
function buildTournamentPayload(data) {
  const payload = {};
  if (data.tournamentCode !== undefined) payload.tournamentCode = data.tournamentCode;
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.startDate !== undefined) payload.startDate = data.startDate;
  if (data.endDate !== undefined) payload.endDate = data.endDate;
  if (data.registrationOpenAt !== undefined) payload.registrationOpenAt = data.registrationOpenAt;
  if (data.registrationCloseAt !== undefined) payload.registrationCloseAt = data.registrationCloseAt;
  if (data.location !== undefined) payload.location = data.location;
  if (data.status !== undefined) payload.status = data.status;
  return payload;
}

export const getTournaments = async (params = {}) => {
  const response = await api.get(TOURNAMENT_ENDPOINT, { params });
  return response.data?.data?.content || response.data?.data;
};

export const getTournamentById = async (id) => {
  const response = await api.get(`${TOURNAMENT_ENDPOINT}/${id}`);
  return response.data?.data;
};

export const createTournament = async (data) => {
  const payload = buildTournamentPayload(data);
  const response = await api.post(TOURNAMENT_ENDPOINT, payload);
  return response.data?.data;
};

export const updateTournament = async (id, data) => {
  const payload = buildTournamentPayload(data);
  const response = await api.put(`${TOURNAMENT_ENDPOINT}/${id}`, payload);
  return response.data?.data;
};

export const deleteTournament = async (id) => {
  const response = await api.delete(`${TOURNAMENT_ENDPOINT}/${id}`);
  return response.data?.success;
};

export const publishTournament = async (id) => {
  const response = await api.patch(`${TOURNAMENT_ENDPOINT}/${id}/publish`);
  return response.data?.data;
};

export const closeRegistration = async (id) => {
  const response = await api.patch(`${TOURNAMENT_ENDPOINT}/${id}/close-registration`);
  return response.data?.data;
};
