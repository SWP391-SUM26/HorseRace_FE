import api from './api';

const ENDPOINT = '/api/v1/files';

export async function getFile(folder, filename) {
  const response = await api.get(`${ENDPOINT}/${folder}/${filename}`);
  return response.data;
}

export function getFileUrl(folder, filename) {
  // Utility function to get the full URL for use in <img src="..." />
  // Assumes the API base URL is configured via environment variable or default
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return `${baseURL}${ENDPOINT}/${folder}/${filename}`;
}
