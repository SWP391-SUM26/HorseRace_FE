const env = {
  // Relative by default → hits the Vite dev proxy (same-origin, no CORS).
  // Override with VITE_API_BASE_URL for production (e.g. https://api.example.com/api/v1).
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api/v1"
};
export {
  env
};
