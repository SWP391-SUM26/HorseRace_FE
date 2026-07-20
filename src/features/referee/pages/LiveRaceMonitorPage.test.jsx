import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Record how the page gates the fast live poll (running flag) via the shared live hook.
const liveRaceCalls = [];
let liveReturn;

// Referee-scoped race sources (default pick + direct deep-link fetch).
let refereeRacesReturn;
let routeRaceReturn;

// Keep the real LiveRunningOrder so we can assert the running order renders; override only the hooks.
vi.mock("@/common/live", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useLiveRace: (raceId, running) => {
      liveRaceCalls.push({ raceId, running });
      return liveReturn;
    },
    useLiveLeaderboard: () => ({ data: [], isLoading: false }),
  };
});

vi.mock("@/features/spectator/hooks", () => ({
  useRaceEntries: () => ({ data: [], isLoading: false }),
}));

vi.mock("../hooks", () => ({
  useRefereeRaces: () => refereeRacesReturn,
  useRefereeRaceById: () => routeRaceReturn,
}));

import LiveRaceMonitorPage from "./LiveRaceMonitorPage";

const runner = {
  position: null,
  entryNo: 1,
  horseName: "Thunder Bolt",
  jockeyName: "A. Mercer",
  currentSpeedKph: null,
};

function makeAssigned(raceId, status) {
  return {
    raceId,
    raceCode: `RC-${raceId}`,
    name: `Race ${raceId}`,
    scheduledStartAt: null,
    status,
    trackCondition: null,
  };
}

function makeDetail(status) {
  return {
    raceId: "r99",
    raceCode: "RC-99",
    name: "Deep Link Derby",
    scheduledStartAt: null,
    status,
    trackCondition: null,
    raceType: "FLAT",
    distanceMeter: 1600,
    tournamentName: "Spring Cup",
  };
}

function renderWithRoute(raceId) {
  const path = raceId ? `/app/referee/live/${raceId}` : "/app/referee/live";
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/referee/live" element={<LiveRaceMonitorPage />} />
        <Route
          path="/app/referee/live/:raceId"
          element={<LiveRaceMonitorPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LiveRaceMonitorPage", () => {
  beforeEach(() => {
    liveRaceCalls.length = 0;
    liveReturn = {
      data: {
        raceId: "r1",
        raceClockMs: 42000,
        videoFeedUrl: null,
        windSpeedKph: 12,
        windDirection: "NE",
        runningOrder: [runner],
      },
      isLoading: false,
    };
    refereeRacesReturn = { data: [], isPending: false };
    routeRaceReturn = { data: undefined, isLoading: false };
  });

  it("deep-link: fetches the routed race directly and polls fast while it is RUNNING", () => {
    routeRaceReturn = { data: makeDetail("RUNNING"), isLoading: false };
    renderWithRoute("r99");
    expect(liveRaceCalls.at(-1)?.raceId).toBe("r99");
    expect(liveRaceCalls.at(-1)?.running).toBe(true);
    expect(screen.getByText("Thunder Bolt")).toBeInTheDocument();
  });

  it("deep-link: stops the fast poll once the routed race is not RUNNING", () => {
    routeRaceReturn = { data: makeDetail("FINISHED"), isLoading: false };
    renderWithRoute("r99");
    expect(liveRaceCalls.at(-1)?.running).toBe(false);
  });

  it("default: picks the referee OWN running assigned race (not a scratch scoped one)", () => {
    refereeRacesReturn = {
      data: [makeAssigned("a1", "FINISHED"), makeAssigned("a2", "RUNNING")],
      isPending: false,
    };
    renderWithRoute();
    expect(liveRaceCalls.at(-1)?.raceId).toBe("a2");
    expect(liveRaceCalls.at(-1)?.running).toBe(true);
  });

  it("default: falls back to the first assigned race when none is RUNNING", () => {
    refereeRacesReturn = {
      data: [makeAssigned("a1", "SCHEDULED"), makeAssigned("a2", "FINISHED")],
      isPending: false,
    };
    renderWithRoute();
    expect(liveRaceCalls.at(-1)?.raceId).toBe("a1");
    expect(liveRaceCalls.at(-1)?.running).toBe(false);
  });

  it("shows an empty state when the referee has no assigned races", () => {
    refereeRacesReturn = { data: [], isPending: false };
    renderWithRoute();
    expect(screen.getByText("No race to monitor")).toBeInTheDocument();
    expect(
      screen.getByText(/no assigned races to officiate/i),
    ).toBeInTheDocument();
  });
});
