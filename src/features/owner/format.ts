/**
 * Owner analytics are denominated in USD, whereas the shared `formatMoney`
 * helper appends '₫'. Format inline as `$` + grouped digits here.
 */
export function usd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}
