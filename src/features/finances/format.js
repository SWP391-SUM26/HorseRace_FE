function usd(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}
function usdCompact(amount) {
  return `$${Math.round(amount / 1e3)}k`;
}
export {
  usd,
  usdCompact
};
