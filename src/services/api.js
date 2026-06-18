import axios from "axios";

const SESSION_KEY = "equine_elite_session";
const REFRESH_ENDPOINT = "/api/v1/auth/refresh";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

let refreshPromise = null;

function getStoredSession() {
  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function updateStoredSession(authData) {
  const currentSession = getStoredSession();
  const nextSession = {
    ...currentSession,
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken || currentSession?.refreshToken,
    tokenType: authData.tokenType || currentSession?.tokenType || "Bearer",
    accessTokenExpiresAt:
      Date.now() + Number(authData.expiresInSeconds || 0) * 1000,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  return nextSession;
}

// Interceptor to inject Bearer Token automatically
api.interceptors.request.use(
  (config) => {
    const session = getStoredSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes("/api/v1/auth/");

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    const session = getStoredSession();
    if (!session?.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${api.defaults.baseURL || ""}${REFRESH_ENDPOINT}`,
            { refreshToken: session.refreshToken },
          )
          .then((response) => {
            const authData = response.data?.data;
            if (!response.data?.success || !authData?.accessToken) {
              throw new Error(response.data?.message || "Token refresh failed.");
            }
            return updateStoredSession(authData);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const nextSession = await refreshPromise;
      originalRequest.headers.Authorization =
        `Bearer ${nextSession.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(SESSION_KEY);
      return Promise.reject(refreshError);
    }
  },
);

export default api;
