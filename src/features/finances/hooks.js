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

/** GET /owner/finances/races — per-race prize won vs. jockey fee paid, most recent race first. */
async function fetchRaceEarnings() {
  const { data } = await apiClient.get("/owner/finances/races", {
    params: { limit: 20 },
  });
  return data.data;
}

export function useOwnerRaceEarnings() {
  return useQuery({
    queryKey: ["finances", "race-earnings"],
    queryFn: fetchRaceEarnings,
  });
}
