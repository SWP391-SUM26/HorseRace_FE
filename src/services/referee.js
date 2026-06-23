import api from './api';

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
