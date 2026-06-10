import api from "./api";
import jockeyMock from "../data/jockeyMock.json";

const DEFAULT_PAGE_SIZE = 4;

function unwrapResponse(response) {
  const body = response?.data;
  return body?.data ?? body;
}

function normalizeListResponse(data, params) {
  if (Array.isArray(data)) {
    return {
      items: data,
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
      totalItems: data.length,
      totalPages: 1,
    };
  }

  const items = data?.items ?? data?.content ?? data?.jockeys ?? [];
  const responsePage =
    data?.page ?? (data?.number !== undefined ? data.number + 1 : params.page);
  const page = Number(responsePage) || 1;
  const pageSize =
    Number(data?.pageSize ?? data?.size ?? params.pageSize) || DEFAULT_PAGE_SIZE;
  const totalItems =
    Number(data?.totalItems ?? data?.totalElements ?? data?.total) || items.length;
  const totalPages =
    Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize));

  return { items, page, pageSize, totalItems, totalPages };
}

function getMockJockeyList(params = {}) {
  const {
    search = "",
    status = "",
    ridingStyle = "",
    minWinRate = "",
    sortBy = "compatibility",
    sortOrder = "desc",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  const normalizedSearch = search.trim().toLowerCase();
  const minimumWinRate = Number(minWinRate) || 0;

  const filtered = jockeyMock.jockeys
    .filter((jockey) => {
      const matchesSearch =
        !normalizedSearch ||
        jockey.name.toLowerCase().includes(normalizedSearch) ||
        jockey.ridingStyle.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !status || jockey.status === status;
      const matchesStyle = !ridingStyle || jockey.ridingStyle === ridingStyle;
      return matchesSearch && matchesStatus && matchesStyle && jockey.winRate >= minimumWinRate;
    })
    .sort((left, right) => {
      const leftValue = left[sortBy] ?? 0;
      const rightValue = right[sortBy] ?? 0;
      const direction = sortOrder === "asc" ? 1 : -1;

      if (typeof leftValue === "string") {
        return leftValue.localeCompare(rightValue) * direction;
      }
      return (leftValue - rightValue) * direction;
    });

  const normalizedPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
  const normalizedPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    items: filtered.slice(start, start + normalizedPageSize),
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalItems,
    totalPages,
  };
}

function shouldUseFallback(error) {
  return !error.response || [404, 405, 501].includes(error.response.status);
}

export async function getJockeyList(params = {}) {
  try {
    const response = await api.get("/jockeys", { params });
    const data = unwrapResponse(response);
    if (typeof data === "string") {
      throw new Error("Jockey API returned a non-JSON response.");
    }
    return normalizeListResponse(data, params);
  } catch (error) {
    if (!shouldUseFallback(error)) throw error;
    console.warn("Jockey API unavailable. Using local fallback data.");
    return getMockJockeyList(params);
  }
}

export async function getJockeyDetail(jockeyId) {
  try {
    const response = await api.get(`/jockeys/${jockeyId}`);
    const data = unwrapResponse(response);
    if (!data || typeof data !== "object") {
      throw new Error("Jockey detail API returned an invalid response.");
    }
    return data;
  } catch (error) {
    if (!shouldUseFallback(error)) throw error;
    console.warn("Jockey detail API unavailable. Using local fallback data.");
    return jockeyMock.jockeys.find((jockey) => jockey.id === jockeyId) ?? null;
  }
}

export async function sendJockeyInvitation(payload) {
  try {
    const response = await api.post("/jockey-invitations", payload);
    const data = unwrapResponse(response);
    if (!data || typeof data !== "object") {
      throw new Error("Invitation API returned an invalid response.");
    }
    return data;
  } catch (error) {
    if (!shouldUseFallback(error)) throw error;
    console.warn("Invitation API unavailable. Returning a local fallback response.");
    return {
      id: `inv_${Date.now()}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ...payload,
    };
  }
}
