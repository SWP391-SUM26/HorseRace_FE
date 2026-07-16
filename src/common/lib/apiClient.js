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
    if (error.response?.status === 401) {
      tokenStore.clear();
      // Force full page redirect to login — the React user state is stale at this
      // point, so a simple navigate() would still render ProtectedRoute with the
      // old user object in memory.  A hard redirect resets everything cleanly.
      const path = window.location.pathname;
      if (path !== "/login" && !path.startsWith("/register")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);
export {
  apiClient,
  attachAuthHeader
};

