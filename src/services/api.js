import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Interceptor to inject Bearer Token automatically
api.interceptors.request.use(
  (config) => {
    const rawSession = localStorage.getItem("equine_elite_session");
    if (rawSession) {
      try {
        const session = JSON.parse(rawSession);
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (err) {
        console.error("Failed to inject auth token", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;