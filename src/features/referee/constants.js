export const INFRACTION_TYPES = [
  { value: "WHIP_USAGE", label: "Excessive Whip Use" },
  { value: "INTERFERENCE", label: "Impeding Progress" },
  { value: "BUMPING", label: "Bumping" },
  { value: "CROWDING", label: "Crowding" },
  { value: "OTHER", label: "Other" },
];

export const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Minor" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const DECISION_TYPES = [
  { value: "NO_ACTION", label: "No Action" },
  { value: "WARNING", label: "Warning" },
  { value: "PENALTY_APPLIED", label: "Penalty Applied" },
  { value: "DISQUALIFICATION", label: "Disqualification" },
];

export const PENALTY_OPTIONS = [
  { value: "WARNING", label: "Warning" },
  { value: "TIME_PENALTY", label: "Time Penalty" },
  { value: "FINE", label: "Fine" },
  { value: "DISQUALIFICATION", label: "Disqualification" },
  { value: "SUSPENSION", label: "Suspension" },
];

export const REGISTRATION_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

/** Severity → Badge tone (shared by violation lists/cards). */
export const SEVERITY_TONE = {
  CRITICAL: "danger",
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

// ---------- Applicant onboarding (Registration Approval) ----------
export const APPLICATION_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "INFO_REQUESTED", label: "Info Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const REQUESTED_ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "OWNER", label: "Owner" },
  { value: "JOCKEY", label: "Jockey" },
];

/** Application status → Badge tone. */
export const APPLICATION_STATUS_TONE = {
  APPROVED: "success",
  REJECTED: "danger",
  PENDING: "warning",
  UNDER_REVIEW: "info",
  INFO_REQUESTED: "neutral",
};
