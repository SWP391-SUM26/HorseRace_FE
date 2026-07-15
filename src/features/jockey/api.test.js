import { describe, it, expect } from "vitest";
import {
  buildTrophies,
  buildWinTrend,
  humanize,
  toUpdateJockeyProfileRequest,
} from "./api";

function ride(partial) {
  return {
    id: "r",
    raceId: "race",
    raceName: "Race",
    venue: "Venue",
    date: "2026-06-01T00:00:00Z",
    horse: "Horse",
    finishPosition: null,
    earnings: null,
    ...partial,
  };
}

describe("humanize", () => {
  it("title-cases an enum-style token", () => {
    expect(humanize("FRONT_RUNNER")).toBe("Front Runner");
    expect(humanize("STALKER")).toBe("Stalker");
  });
});

describe("buildWinTrend", () => {
  const now = new Date("2026-06-15T00:00:00Z");

  it("returns 12 trailing months ending with the current month", () => {
    const points = buildWinTrend([], now);
    expect(points).toHaveLength(12);
    expect(points[11].month).toBe("Jun"); // current month last
    expect(points[0].month).toBe("Jul"); // 11 months earlier
  });

  it("counts only wins (finishPosition === 1) into the matching month bucket", () => {
    const points = buildWinTrend(
      [
        ride({ date: "2026-06-02T00:00:00Z", finishPosition: 1 }),
        ride({ date: "2026-06-20T00:00:00Z", finishPosition: 1 }),
        ride({ date: "2026-05-10T00:00:00Z", finishPosition: 2 }), // not a win
      ],
      now,
    );
    expect(points[11].wins).toBe(2); // June
    expect(points[10].wins).toBe(0); // May (the 2nd-place ride doesn't count)
  });

  it("ignores wins outside the trailing 12-month window", () => {
    const points = buildWinTrend(
      [ride({ date: "2024-10-24T00:00:00Z", finishPosition: 1 })],
      now,
    );
    expect(points.reduce((s, p) => s + p.wins, 0)).toBe(0);
  });
});

describe("toUpdateJockeyProfileRequest", () => {
  it("keeps filled fields and drops empty/undefined (partial update)", () => {
    const body = toUpdateJockeyProfileRequest({
      bodyWeight: 55,
      heightCm: undefined,
      ridingStyle: "Stalker",
      bio: "   ",
      licenseNo: "",
      baseFee: 0,
      prizePercent: 10,
    });
    expect(body).toEqual({
      bodyWeight: 55,
      ridingStyle: "Stalker",
      baseFee: 0,
      prizePercent: 10,
    });
    // blank/whitespace strings and undefined numbers are omitted entirely
    expect("heightCm" in body).toBe(false);
    expect("bio" in body).toBe(false);
    expect("licenseNo" in body).toBe(false);
  });

  it("trims string fields it keeps", () => {
    const body = toUpdateJockeyProfileRequest({
      ridingStyle: "  Closer  ",
      licenseNo: " LIC-9 ",
    });
    expect(body).toEqual({ ridingStyle: "Closer", licenseNo: "LIC-9" });
  });
});

describe("buildTrophies", () => {
  it("keeps only races won, newest first, deduped by name+year", () => {
    const trophies = buildTrophies([
      ride({
        raceName: "Derby",
        date: "2024-05-01T00:00:00Z",
        finishPosition: 1,
      }),
      ride({
        raceName: "Oaks",
        date: "2025-06-01T00:00:00Z",
        finishPosition: 1,
      }),
      ride({
        raceName: "Derby",
        date: "2024-05-01T00:00:00Z",
        finishPosition: 1,
      }), // dup
      ride({
        raceName: "Sprint",
        date: "2025-01-01T00:00:00Z",
        finishPosition: 3,
      }), // not a win
    ]);
    expect(trophies).toEqual([
      { name: "Oaks", year: 2025 },
      { name: "Derby", year: 2024 },
    ]);
  });
});
