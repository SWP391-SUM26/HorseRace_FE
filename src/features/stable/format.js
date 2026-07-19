/**
 * Stable analytics are VND, like every other money value in the app. These used to render `$`
 * with en-US grouping (matching an early Figma) while the wallet, prizes and finance screens
 * showed `₫` — the same earnings appeared as two different currencies depending on the page.
 */
export function usd(amount) {
  return `${Math.round(amount).toLocaleString("vi-VN")}₫`;
}

const ORDINAL_SUFFIX = { 1: "st", 2: "nd", 3: "rd" };

/** 1 → "1st", 2 → "2nd", 11 → "11th". */
export function ordinal(n) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  return `${n}${ORDINAL_SUFFIX[n % 10] ?? "th"}`;
}
