const ROLE_LABELS = {
  ADMIN: "Admin",
  OWNER: "Horse Owner",
  HORSE_OWNER: "Horse Owner",
  JOCKEY: "Jockey",
  RACE_REFEREE: "Referee",
  SPECTATOR: "Spectator"
};

const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  OWNER: "/app/owner/tournaments",
  HORSE_OWNER: "/app/owner/tournaments",
  JOCKEY: "/jockey-dashboard",
  RACE_REFEREE: "/referee/dashboard",
  SPECTATOR: "/spectator-dashboard"
};

export {
  ROLE_HOME,
  ROLE_LABELS
};
