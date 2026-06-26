const ROLE_LABELS = {
  ADMIN: "Admin",
  OWNER: "Horse Owner",
  HORSE_OWNER: "Horse Owner",
  JOCKEY: "Jockey",
  RACE_REFEREE: "Referee",
  SPECTATOR: "Spectator"
};

const ROLE_HOME = {
  ADMIN: "/admin",
  OWNER: "/owner/overview",
  HORSE_OWNER: "/owner/overview",
  JOCKEY: "/jockey-dashboard",
  RACE_REFEREE: "/referee/dashboard",
  SPECTATOR: "/spectator-dashboard"
};

export {
  ROLE_HOME,
  ROLE_LABELS
};
