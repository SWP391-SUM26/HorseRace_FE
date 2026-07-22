const KEY = "ee_access_token";

export const tokenStore = {
  get() {
    return localStorage.getItem(KEY);
  },
  set(token) {
    localStorage.setItem(KEY, token);
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};

/**
 * True when the stored access token is missing, unparseable, or past its `exp`.
 *
 * Read-only inspection of a token we already hold — never a substitute for server-side validation.
 * It exists so a 401 can be attributed: an expired token means the session really is over, while a
 * 401 arriving on a still-valid token came from a service-layer business guard and must NOT destroy
 * the session. Pairs with the `X-Session-Invalid` header and stays correct if that header is ever
 * stripped (e.g. a cross-origin deploy that forgets `Access-Control-Expose-Headers`).
 */
export function isAccessTokenExpired(now = Date.now()) {
  const token = tokenStore.get();
  if (!token) return true;
  const payload = token.split(".")[1];
  if (!payload) return true;
  try {
    // base64url -> base64 before decoding; JWT payloads are unpadded base64url.
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json).exp;
    // No `exp` claim means we cannot prove expiry — treat as still valid, let the server decide.
    return typeof exp === "number" && exp * 1000 <= now;
  } catch {
    return true; // malformed token is as good as absent
  }
}
