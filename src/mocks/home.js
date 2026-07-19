// MOCK — no public BE endpoint.
// All data on the public HomePage widgets is static mock data because these
// marketing widgets have NO backing API. Replace with real endpoints later.

// MOCK — no public BE endpoint.
export const liveRace = {
  event: "Royal Ascot",
  location: "Ascot, UK",
  going: "Good to Firm (3.4)",
  nextPostTime: "04:12:35",
  raceLabel: "R5",
};

// MOCK — no public BE endpoint.
export const marketLeaders = [
  { rank: 1, horse: "Midnight Runner", jockey: "J. McConnell", odds: "2/1" },
  { rank: 2, horse: "Desert Storm", jockey: "W. Buick", odds: "7/2" },
  { rank: 3, horse: "Ocean Pearl", jockey: "L. Marquand", odds: "11/2" },
];

// MOCK — no public BE endpoint.
export const aiInsight = {
  text: "Midnight Runner shows the strongest closing-sectional form on Good to Firm ground.",
  winPct: 66,
};

// MOCK — no public BE endpoint.
export const leaderboard = [
  { rank: "01", name: "Fitzgerald Stables", role: "Trainer", meta: "Gold" },
  { rank: "02", name: "Aiden Speed", role: "Owner", meta: "Silver" },
  { rank: "03", name: "James McDonald", role: "Jockey", meta: "Bronze" },
];

// MOCK — no public BE endpoint.
export const featuredHorse = {
  name: "Silver Streak",
  grade: "Grade 1 · Flat Turf",
  wins: 4,
  races: 12,
  winRate: 88,
  metrics: {
    stamina: 90,
    speed: 84,
    temperament: 78,
  },
};
