/** Stable analytics are denominated in USD (matching the Figma). */
export function usd(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

const ORDINAL_SUFFIX = { 1: "st", 2: "nd", 3: "rd" };

/** 1 → "1st", 2 → "2nd", 11 → "11th". */
export function ordinal(n) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  return `${n}${ORDINAL_SUFFIX[n % 10] ?? "th"}`;
}
