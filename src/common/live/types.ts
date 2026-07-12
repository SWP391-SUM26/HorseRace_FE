// Shared live-race types — consumed by both the spectator live page and the referee monitor.

/** One runner row inside a live snapshot / leaderboard. `position` is null until RaceResult rows exist. */
export interface RunnerRow {
  position: number | null;
  entryNo: number | null;
  horseName: string;
  jockeyName: string | null;
  /** Always null — no telemetry source on the BE. */
  currentSpeedKph: number | null;
}

/** GET /races/{raceId}/live */
export interface LiveRaceResponse {
  raceId: string;
  raceClockMs: number | null;
  videoFeedUrl: string | null;
  windSpeedKph: number | null;
  windDirection: string | null;
  runningOrder: RunnerRow[];
}
