import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/common/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(async () => ({ data: { data: [] } })),
    post: vi.fn(async () => ({ data: { data: { predictionId: "p1" } } })),
  },
}));

import { apiClient } from "@/common/lib/apiClient";
import {
  useSubmitPrediction,
  useClaimReward,
  useLiveRace,
  useEntryNames,
} from "./hooks";

const getMock = apiClient.get;

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const spy = vi.spyOn(qc, "invalidateQueries");
  const wrapper = ({ children }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { wrapper, spy };
}

describe("spectator mutation hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useSubmitPrediction invalidates the predictions query on success", async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useSubmitPrediction(), { wrapper });
    result.current.mutate({
      raceId: "r1",
      predictionType: "WIN",
      stakeAmount: 100,
      predictedEntryId: "e1",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({
      queryKey: ["spectator", "predictions"],
    });
  });

  it("useClaimReward invalidates the rewards query on success", async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useClaimReward(), { wrapper });
    result.current.mutate("reward-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: ["spectator", "rewards"] });
  });
});

describe("useEntryNames — entryId → horseName resolution", () => {
  beforeEach(() => vi.clearAllMocks());
  // Restore the default empty-list response so other suites are unaffected by the per-race mock.
  afterEach(() =>
    getMock.mockImplementation(async () => ({ data: { data: [] } })),
  );

  it("folds runners across unique races into one Map and de-dupes raceIds", async () => {
    getMock.mockImplementation(async (url) => {
      if (url === "/races/r1/entries")
        return {
          data: { data: [{ entryId: "e1", horseName: "Thunderbolt" }] },
        };
      if (url === "/races/r2/entries")
        return {
          data: { data: [{ entryId: "e2", horseName: "Silver Streak" }] },
        };
      return { data: { data: [] } };
    });
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useEntryNames(["r1", "r1", "r2"]), {
      wrapper,
    });
    await waitFor(() => expect(result.current.size).toBe(2));
    expect(result.current.get("e1")).toBe("Thunderbolt");
    expect(result.current.get("e2")).toBe("Silver Streak");
    // r1, r1, r2 → 2 unique entries fetches.
    expect(getMock).toHaveBeenCalledTimes(2);
  });
});

describe("useLiveRace — fast poll gating", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does NOT keep polling once the race is not RUNNING", async () => {
    vi.useFakeTimers();
    try {
      const { wrapper } = makeWrapper();
      renderHook(() => useLiveRace("r1", false), { wrapper });
      await vi.advanceTimersByTimeAsync(8000); // ~3 live-poll intervals
      // Only the initial fetch — no repeated polling when the poll interval is falsy.
      expect(getMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("polls repeatedly while the race IS RUNNING", async () => {
    vi.useFakeTimers();
    try {
      const { wrapper } = makeWrapper();
      renderHook(() => useLiveRace("r1", true), { wrapper });
      await vi.advanceTimersByTimeAsync(6000); // ~2 live-poll intervals past the initial fetch
      expect(getMock.mock.calls.length).toBeGreaterThan(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
