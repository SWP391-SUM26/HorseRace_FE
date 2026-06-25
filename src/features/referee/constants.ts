import type { InfractionType, PenaltyType, SeverityLevel } from './types';

export const INFRACTION_TYPES: { value: InfractionType; label: string }[] = [
  { value: 'WHIP_USAGE', label: 'Excessive Whip Use' },
  { value: 'INTERFERENCE', label: 'Impeding Progress' },
  { value: 'BUMPING', label: 'Bumping' },
  { value: 'CROWDING', label: 'Crowding' },
  { value: 'OTHER', label: 'Other' },
];

export const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'LOW', label: 'Minor' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const DECISION_TYPES = [
  { value: 'NO_ACTION', label: 'No Action' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'PENALTY_APPLIED', label: 'Penalty Applied' },
  { value: 'DISQUALIFICATION', label: 'Disqualification' },
];

export const PENALTY_OPTIONS: { value: PenaltyType; label: string }[] = [
  { value: 'WARNING', label: 'Warning' },
  { value: 'TIME_PENALTY', label: 'Time Penalty' },
  { value: 'FINE', label: 'Fine' },
  { value: 'DISQUALIFICATION', label: 'Disqualification' },
  { value: 'SUSPENSION', label: 'Suspension' },
];

export const REGISTRATION_STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

/** Severity → Badge tone (shared by violation lists/cards). */
export const SEVERITY_TONE: Record<SeverityLevel, 'danger' | 'warning' | 'neutral' | 'info'> = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'neutral',
};
