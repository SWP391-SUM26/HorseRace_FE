import { apiClient } from "@/common/lib/apiClient";

function toPage(data) {
  if (Array.isArray(data)) {
    return { rows: data, totalPages: 1, page: 0, total: data.length };
  }
  return {
    rows: data?.content ?? [],
    totalPages: data?.totalPages ?? 1,
    page: data?.number ?? 0,
    total: data?.totalElements ?? data?.content?.length ?? 0
  };
}

export async function getWallet() {
  const { data } = await apiClient.get("/wallet");
  return data.data;
}

export async function getTransactions(query = {}) {
  const { data } = await apiClient.get("/wallet/transactions", {
    params: { size: 20, ...query }
  });
  return toPage(data.data);
}

export async function topup(amount) {
  const { data } = await apiClient.post("/wallet/topup", { amount });
  return data.data;
}

export async function withdraw(amount) {
  const { data } = await apiClient.post("/wallet/withdraw", { amount });
  return data.data;
}

export async function getVnPayReturn(queryString) {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  const { data } = await apiClient.get("/wallet/vnpay-return", { params });
  return data.data;
}
