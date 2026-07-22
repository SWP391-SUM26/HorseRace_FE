import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/common/lib/apiClient";

/**
 * GET /owner/finances — real ledger-backed figures.
 *
 * This page used to resolve a hardcoded `financeOverviewMock` behind a
 * setTimeout, so every owner saw the same invented numbers. The endpoint
 * returns the same shape, so nothing below the hook changed.
 */
async function fetchFinanceOverview() {
  const { data } = await apiClient.get("/owner/finances", {
    params: { txnLimit: 20 },
  });
  return data.data;
}

export function useFinanceOverview() {
  return useQuery({
    queryKey: ["finances", "overview"],
    queryFn: fetchFinanceOverview,
  });
}
