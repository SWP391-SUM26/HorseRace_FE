/**
 * Canonical thoroughbred running styles. The BE stores ridingStyle as free text
 * (VARCHAR(50), no enum), and seed data uses values like "Stalker", so the
 * profile-edit Select offers these and injects the current server value if it
 * isn't already in the list (avoids a blank Select for legacy values).
 */
export const RIDING_STYLE_OPTIONS = [
  'Front Runner',
  'Stalker',
  'Presser',
  'Closer',
  'Swinger',
] as const;
