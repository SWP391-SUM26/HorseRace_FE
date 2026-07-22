// Shared comparators for displaying lists in a stable, human-friendly order.

// Vietnamese-aware collator: correct diacritic ordering and natural numeric
// ordering so "Horse 2" sorts before "Horse 10".
const nameCollator = new Intl.Collator("vi", { numeric: true, sensitivity: "variant" });

/**
 * Comparator that sorts items alphabetically (A→Z) by a display name.
 * Use with a spread copy so the source array is not mutated:
 *   [...list].sort(byName("fullName"))
 *
 * @param {string|((item:any)=>string)} key - field name, or an accessor
 *   returning the display name. Defaults to the `name` field.
 */
export function byName(key = "name") {
  const get = typeof key === "function" ? key : (item) => item?.[key];
  return (a, b) => nameCollator.compare(get(a) ?? "", get(b) ?? "");
}

/**
 * Comparator that sorts items by a date field. Defaults to newest-first.
 * Items with a missing/invalid date sink to the bottom. Use with a spread copy:
 *   [...list].sort(byDate("startDate"))            // newest first
 *   [...list].sort(byDate("scheduledStartAt", "asc")) // oldest first
 *
 * @param {string|((item:any)=>any)} key - date field name, or an accessor
 *   returning a Date/ISO-string/timestamp.
 * @param {"desc"|"asc"} [dir="desc"] - "desc" = newest first, "asc" = oldest first.
 */
export function byDate(key, dir = "desc") {
  const get = typeof key === "function" ? key : (item) => item?.[key];
  const sign = dir === "asc" ? 1 : -1;
  const ms = (item) => {
    const t = new Date(get(item) ?? 0).getTime();
    return Number.isNaN(t) ? 0 : t;
  };
  return (a, b) => sign * (ms(a) - ms(b));
}
