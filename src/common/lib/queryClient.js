import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 3e4, retry: 1, refetchOnWindowFocus: false }
  }
});
export {
  queryClient
};
