import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/common/lib/queryClient";
function QueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
export {
  QueryProvider
};
