/**
 * Finance figures are VND, like every other money value in the app. These used
 * to render `$` with en-US grouping while the wallet, prizes and betting
 * screens all showed `₫` — the same prize money appeared as two different
 * currencies depending on the page.
 */
export function usd(amount) {
  return `${Math.round(amount).toLocaleString("vi-VN")}₫`;
}

/**
 * Compact label used by the horse-profitability bars, e.g. `120tr₫`
 * (triệu = million).
 */
export function usdCompact(amount) {
  if (Math.abs(amount) >= 1_000_000) {
    return `${Math.round(amount / 1_000_000).toLocaleString("vi-VN")}tr₫`;
  }
  return `${Math.round(amount / 1000).toLocaleString("vi-VN")}k₫`;
}
