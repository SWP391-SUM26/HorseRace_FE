import { apiClient } from "@/common/lib/apiClient";
import { parseOdds } from "@/features/spectator/constants";

// --- local list unwrapper (per-module convention; not shared) ---------------
function toArray(d) {
  if (Array.isArray(d)) return d;
  return d?.content ?? [];
}

// Race lifecycle priority for picking "what's happening now" on the public Home
// page — lower is more interesting. Anything else (FINISHED/OFFICIAL/CANCELLED)
// is not a candidate.
const FEATURED_STATUS_RANK = { RUNNING: 0, CLOSED: 1, OPEN: 2, SCHEDULED: 3 };

/**
 * GET /races (public) → the single most "live" race to headline the Home page:
 * prefer RUNNING, else the soonest CLOSED/OPEN/SCHEDULED race. Returns null if
 * nothing qualifies (e.g. an empty DB).
 */
export async function fetchFeaturedRace() {
  const { data } = await apiClient.get("/races", { params: { size: 50 } });
  const races = toArray(data.data);
  const candidates = races.filter((r) => r.status in FEATURED_STATUS_RANK);
  candidates.sort((a, b) => {
    const rank = FEATURED_STATUS_RANK[a.status] - FEATURED_STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    return new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt);
  });
  return candidates[0] ?? null;
}

/**
 * GET /races/{id}/entries (public) → top 3 runners by best (lowest) odds, for the
 * "Market Leaders" list. Runners with unparseable/missing odds sort last.
 */
export async function fetchMarketLeaders(raceId) {
  const { data } = await apiClient.get(`/races/${raceId}/entries`);
  const entries = toArray(data.data);
  return entries
    .slice()
    .sort((a, b) => (parseOdds(a.odds) ?? Infinity) - (parseOdds(b.odds) ?? Infinity))
    .slice(0, 3)
    .map((e, i) => ({
      rank: i + 1,
      horse: e.horseName ?? "—",
      jockey: e.jockeyName ?? "TBD",
      odds: e.odds ?? "—",
    }));
}

/**
 * GET /standings/horses (public, limit=1) + GET /horses/{id}/stats (public) →
 * the top-ranked horse's real career stats, for the Virtual Paddock feature.
 * Returns null if no horse has a ranked result yet.
 */
export async function fetchFeaturedHorse() {
  const { data: standingsData } = await apiClient.get("/standings/horses", {
    params: { limit: 1 },
  });
  const top = toArray(standingsData.data)[0];
  if (!top) return null;

  const horseId = top.jockeyUserId; // generic leaderboard row: holds the horseId here
  const { data: statsData } = await apiClient.get(`/horses/${horseId}/stats`);
  const stats = statsData.data;

  const winRate = stats.starts > 0 ? Math.round((stats.wins / stats.starts) * 100) : 0;
  return {
    name: top.name,
    grade: stats.grade ?? null,
    wins: stats.wins,
    starts: stats.starts,
    winRate,
    characteristics: stats.characteristics ?? [],
  };
}

/**
 * GET /standings/jockeys + /standings/predictors (public, limit=2 each) → a mixed
 * "Global Leaderboard" of the two public-facing standings categories this system
 * actually has (there is no Trainer role).
 */
export async function fetchGlobalLeaderboard() {
  const [jockeys, predictors] = await Promise.all([
    apiClient.get("/standings/jockeys", { params: { limit: 2 } }),
    apiClient.get("/standings/predictors", { params: { limit: 1 } }),
  ]);
  const rows = [
    ...toArray(jockeys.data.data).map((e) => ({ ...e, role: "Jockey" })),
    ...toArray(predictors.data.data).map((e) => ({ ...e, role: "Predictor" })),
  ];
  return rows.map((e, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    name: e.name,
    role: e.role,
  }));
}
