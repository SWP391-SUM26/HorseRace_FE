const DEFAULT_API_ORIGIN = "http://localhost:8080";

function getApiOrigin() {
  const configured =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  const origin = configured
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/api\/?$/i, "")
    .replace(/\/$/, "");

  return origin || DEFAULT_API_ORIGIN;
}

export function normalizeBackendImageUrl(value, fallback = null) {
  if (!value || typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/api/")) return trimmed;
  if (trimmed.startsWith("/")) return `${getApiOrigin()}${trimmed}`;

  return `${getApiOrigin()}/${trimmed}`;
}
