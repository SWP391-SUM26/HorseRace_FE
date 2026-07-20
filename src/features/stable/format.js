export function usd(amount) {
  return `$${Number(amount ?? 0).toLocaleString("en-US")}`;
}

const ORDINAL_SUFFIX = { 1: "st", 2: "nd", 3: "rd" };

export function ordinal(n) {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  return `${n}${ORDINAL_SUFFIX[n % 10] ?? "th"}`;
}
