import { Spinner } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";

/**
 * Holds the router back until the session has been rehydrated.
 *
 * `AuthProvider` fetches /users/me on load, so for the duration of that round-trip `user` is null.
 * Without this gate every guarded route renders during that window, sees no user, and redirects —
 * which is why a hard refresh on any signed-in page bounced you to /login.
 */
export function AppBootstrap({ children }) {
  const { bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner className="h-8 w-8 text-brand-700" />
      </div>
    );
  }
  return <>{children}</>;
}
