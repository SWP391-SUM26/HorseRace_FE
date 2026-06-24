const FEATURE_SOURCE = {
  auth: "real",
  users: "real",
  horses: "real",
  jockeys: "real",
  assignments: "real",
  races: "real",
  tournaments: "real",
  registrations: "real",
  predictions: "real",
  staffing: "real",
  dashboard: "mock",
  liveRace: "mock",
  finances: "mock",
  results: "mock",
  violations: "mock",
  notifications: "mock"
};
const isMock = (k) => FEATURE_SOURCE[k] === "mock";
export {
  FEATURE_SOURCE,
  isMock
};
