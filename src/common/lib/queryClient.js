import { MutationCache, QueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "./apiError";
import { toastError } from "./toastBus";

/**
 * Global mutation error handling: every mutation error surfaces the BE message (via the canonical
 * `getApiErrorMessage`) through the toast bus, unless the mutation opts out with
 * `meta: { skipGlobalErrorToast: true }` (self-rendering mutations, e.g. register forms).
 * No `QueryCache.onError` — background refetch failures must not toast (handled in-place).
 */
const mutationCache = new MutationCache({
  onError: (err, _vars, _ctx, mutation) => {
    if (!mutation.meta?.skipGlobalErrorToast) toastError(getApiErrorMessage(err));
  },
});

/**
 * Never retry an auth failure. A 401 will not turn into a 200 on the second attempt, and retrying
 * doubled the noise from the always-mounted 30s notifications poll.
 */
function retryUnlessUnauthorized(failureCount, error) {
  if (error?.response?.status === 401) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: retryUnlessUnauthorized,
      refetchOnWindowFocus: false,
    },
  },
});
