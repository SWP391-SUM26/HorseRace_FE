import axios from "axios";
import { env } from "@/common/config/env";
import { tokenStore } from "./storage";
function attachAuthHeader(config) {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}
const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" }
});
apiClient.interceptors.request.use(attachAuthHeader);
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) tokenStore.clear();
    return Promise.reject(error);
  }
);
export {
  apiClient,
  attachAuthHeader
};
