import type { HistoricalWin, PrizeTier } from './types';

// STATIC — BE does not expose these. Display-only values from the "Race Details" Figma.

export const STATIC_HISTORICAL_WINS: HistoricalWin[] = [
  { horse: 'Courage Mon Ami', year: 2023, time: '4:20.97', record: true },
  { horse: 'Kyprios', year: 2022, time: '4:26.52', record: false },
  { horse: 'Subjectivist', year: 2021, time: '4:20.28', record: false },
];

export const STATIC_PRIZE_TIERS: PrizeTier[] = [
  { place: '1st', amount: 340260, label: '£340,260' },
  { place: '2nd', amount: 129000, label: '£129,000' },
  { place: '3rd', amount: 64560, label: '£64,560' },
  { place: '4th', amount: 32160, label: '£32,160' },
];

/**
 * STATIC — BE does not expose these. The race header, GOING/DISTANCE/RACE-TYPE
 * tile sub-labels, the imperial distance label, total purse and venue are all
 * display-only fields with no backing endpoint.
 */
export const STATIC_RACE = {
  venue: 'Ascot Racecourse, UK',
  going: { label: 'Good to Firm', moisture: 'Moisture 14%' },
  distanceLabel: '2m 4f',
  raceTypeSub: 'Ages 4+ Open',
  totalPurse: '£600,000',
  historicalWins: STATIC_HISTORICAL_WINS,
  prizeTiers: STATIC_PRIZE_TIERS,
} as const;
