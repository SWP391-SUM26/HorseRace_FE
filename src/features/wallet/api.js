import { apiClient } from "@/common/lib/apiClient";

// --- local list unwrappers (per-module convention; mirrors features/spectator/api.js) --------
/** Unwrap a paginated payload into a consistent shape. */
function toPage(d) {
  if (Array.isArray(d))
    return { rows: d, totalPages: 1, page: 0, total: d.length };
  return {
    rows: d?.content ?? [],
    totalPages: d?.totalPages ?? 1,
    page: d?.number ?? 0,
    total: d?.totalElements ?? d?.content?.length ?? 0,
  };
}

// ---------- Wallet ----------
/** GET /wallet → balance/locked/currency/status (auto-creates the wallet). */
export async function getWallet() {
  const { data } = await apiClient.get("/wallet");
  return data.data;
}

/** GET /wallet/transactions → Page (newest first). */
export async function getTransactions(query = {}) {
  const { data } = await apiClient.get("/wallet/transactions", {
    params: { size: 20, ...query },
  });
  return toPage(data.data);
}

/** POST /wallet/topup → { payUrl } to redirect the browser to VNPay. */
export async function topup(amount) {
  const { data } = await apiClient.post("/wallet/topup", { amount });
  return data.data;
}

/** POST /wallet/withdraw → holds the amount and creates a PENDING request. */
export async function withdraw(amount) {
  const { data } = await apiClient.post("/wallet/withdraw", { amount });
  return data.data;
}

/**
 * GET /wallet/vnpay-return — the BE verifies the checksum and echoes back the status.
 * `queryString` is the raw `location.search` (without the leading `?` is fine either way).
 */
export async function getVnPayReturn(queryString) {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  const { data } = await apiClient.get("/wallet/vnpay-return", { params });
  return data.data;
}
