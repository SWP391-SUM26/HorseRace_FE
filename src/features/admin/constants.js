const REGISTRATION_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" }
];
const REGISTRATION_STATUS_TONE = {
  APPROVED: "success",
  REJECTED: "danger",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  DRAFT: "neutral",
  WITHDRAWN: "neutral",
  REMOVED: "neutral"
};
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "HORSE_OWNER", label: "Owner" },
  { value: "JOCKEY", label: "Jockey" },
  { value: "RACE_REFEREE", label: "Referee" },
  { value: "SPECTATOR", label: "Spectator" }
];
const ROLE_FILTERS = [{ value: "", label: "All roles" }, ...ROLE_OPTIONS];
const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" }
];
const USER_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  ...USER_STATUS_OPTIONS
];
const USER_STATUS_TONE = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "warning",
  BANNED: "danger",
  PENDING: "warning"
};
const TOURNAMENT_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REGISTRATION_OPEN", label: "Registration Open" },
  { value: "REGISTRATION_CLOSED", label: "Registration Closed" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];
const TOURNAMENT_STATUS_TONE = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  REGISTRATION_OPEN: "success",
  REGISTRATION_CLOSED: "warning",
  ONGOING: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger"
};
const RACE_STATUS_LABEL = {
  // SCHEDULED = pending admin publish; OPEN = published (registration open).
  SCHEDULED: "Pending",
  OPEN: "Published (open)",
  CLOSED: "Closed",
  RUNNING: "Active",
  FINISHED: "Finished",
  OFFICIAL: "Official",
  CANCELLED: "Cancelled"
};
const RACE_STATUS_TONE = {
  SCHEDULED: "info",
  OPEN: "warning",
  CLOSED: "neutral",
  RUNNING: "success",
  FINISHED: "neutral",
  OFFICIAL: "success",
  CANCELLED: "danger"
};
const RACE_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "OPEN", label: "Open" },
  { value: "RUNNING", label: "Active" },
  { value: "FINISHED", label: "Finished" },
  { value: "CANCELLED", label: "Cancelled" }
];
const HORSE_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "RETIRED", label: "Retired" },
  { value: "INACTIVE", label: "Inactive" }
];
const HORSE_GENDER_FILTERS = [
  { value: "", label: "All genders" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "GELDING", label: "Gelding" }
];
const HORSE_STATUS_TONE = {
  ACTIVE: "success",
  RETIRED: "neutral",
  INACTIVE: "warning"
};
const HORSE_HEALTH_TONE = {
  HEALTHY: "success",
  INJURED: "danger",
  QUARANTINE: "warning",
  UNFIT: "danger"
};
const JOCKEY_SORT_OPTIONS = [
  { value: "winCount", label: "Wins" },
  { value: "experienceYrs", label: "Experience" },
  { value: "fullName", label: "Name" },
  { value: "bodyWeight", label: "Weight" },
  { value: "heightCm", label: "Height" }
];
const PANEL_ROLE_OPTIONS = [
  { value: "CHIEF", label: "Chief Steward" },
  { value: "JUDGE", label: "Judge" },
  { value: "STEWARD", label: "Steward" },
  { value: "TIMEKEEPER", label: "Timekeeper" },
  { value: "OBSERVER", label: "Observer" }
];
export {
  HORSE_GENDER_FILTERS,
  HORSE_HEALTH_TONE,
  HORSE_STATUS_FILTERS,
  HORSE_STATUS_TONE,
  JOCKEY_SORT_OPTIONS,
  PANEL_ROLE_OPTIONS,
  RACE_STATUS_FILTERS,
  RACE_STATUS_LABEL,
  RACE_STATUS_TONE,
  REGISTRATION_STATUS_FILTERS,
  REGISTRATION_STATUS_TONE,
  ROLE_FILTERS,
  ROLE_OPTIONS,
  TOURNAMENT_STATUS_FILTERS,
  TOURNAMENT_STATUS_TONE,
  USER_STATUS_FILTERS,
  USER_STATUS_OPTIONS,
  USER_STATUS_TONE
};
