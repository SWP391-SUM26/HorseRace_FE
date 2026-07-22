import axios from "axios";
import { env } from "@/common/config/env";
import { emitSessionExpired } from "./sessionBus";
import { isAccessTokenExpired, tokenStore } from "./storage";

export function attachAuthHeader(config) {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(attachAuthHeader);

/**
 * Does this 401 mean the session is over, or merely that a request was refused?
 *
 * The backend returns 401 for two very different things: `JwtAuthEntryPoint` (no/expired/invalid
 * credential — genuinely fatal) and ~62 service-layer `AppException(UNAUTHENTICATED)` guards plus
 * `INVALID_CREDENTIALS` on the login form (business outcomes on a perfectly live session). Treating
 * the second kind as fatal is what silently logged admins out mid-session.
 *
 * Two independent signals, either of which is conclusive:
 *  - `X-Session-Invalid`, set only by the entry point;
 *  - a stored token that is already past its own `exp`.
 * `/auth/*` is excluded outright so a mistyped password never destroys an existing session.
 */
function isSessionTerminal(error) {
  if (error.response?.status !== 401) return false;
  if ((error.config?.url ?? "").startsWith("/auth/")) return false;
  return (
    error.response.headers?.["x-session-invalid"] === "1" || isAccessTokenExpired()
  );
}

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // The token check also de-dupes: once the first 401 clears it, concurrent failures (the
    // notifications poll fires every 30s on every page) fall through as no-ops.
    if (isSessionTerminal(error) && tokenStore.get()) {
      tokenStore.clear();
      emitSessionExpired();
    }
    return Promise.reject(error);
  },
);
