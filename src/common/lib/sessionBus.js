/**
 * Module-level bridge letting the axios response interceptor tell React that the session is dead.
 * Mirrors `toastBus` — `AuthProvider` registers a handler once mounted; before that (or after
 * unmount) the emitter optional-chains to a no-op.
 *
 * Why this exists: `apiClient` used to clear the token and stop there, leaving `AuthProvider.user`
 * populated. The UI kept looking signed-in while every request went out unauthenticated, and the
 * bounce to /login only landed on the next reload — which is what made the logout feel random.
 */
let onSessionExpired = null;

/** Wire the live handler. Idempotent — last registration wins. */
export function registerSessionExpiredHandler(next) {
  onSessionExpired = next;
}

export const emitSessionExpired = () => onSessionExpired?.();
