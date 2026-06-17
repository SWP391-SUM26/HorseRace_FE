import api from "./api";

const JOCKEY_ENDPOINT = "/api/v1/jockeys";
const INVITATION_ENDPOINT = "/api/v1/assignments/invitations";
const DEFAULT_PAGE_SIZE = 4;

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data;
}

function normalizeListResponse(data, params, keys = []) {
  if (Array.isArray(data)) {
    return {
      items: data,
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || data.length || DEFAULT_PAGE_SIZE,
      totalItems: data.length,
      totalPages: 1,
    };
  }

  const items =
    data?.content ??
    data?.items ??
    keys.reduce((result, key) => result ?? data?.[key], null) ??
    [];
  const apiPage = data?.number !== undefined ? data.number + 1 : data?.page;
  const page = Number(apiPage ?? params.page) || 1;
  const pageSize =
    Number(data?.size ?? data?.pageSize ?? params.pageSize) || DEFAULT_PAGE_SIZE;
  const totalItems =
    Number(data?.totalElements ?? data?.totalItems ?? data?.total) || items.length;

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages:
      Number(data?.totalPages) || Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

function mapJockeyToUI(jockey = {}) {
  const careerWins = Number(jockey.winCount ?? jockey.careerWins ?? 0);
  const experience = Number(jockey.experienceYrs ?? jockey.experience ?? 0);
  const totalRaces = Number(jockey.totalRaces ?? Math.max(careerWins * 4, careerWins));
  const winRate =
    jockey.winRate !== undefined
      ? Number(jockey.winRate)
      : totalRaces > 0
        ? Number(((careerWins / totalRaces) * 100).toFixed(1))
        : 0;

  return {
    id: jockey.userId || jockey.id,
    userId: jockey.userId || jockey.id,
    userCode: jockey.userCode,
    name: jockey.fullName || jockey.name || "Unknown Jockey",
    email: jockey.email || "",
    phone: jockey.phone || "",
    avatar: jockey.avatarUrl || jockey.avatar || "",
    status: jockey.status === "ACTIVE" ? "AVAILABLE" : jockey.status || "AVAILABLE",
    ridingStyle: jockey.ridingStyle || "Versatile",
    experience,
    totalRaces,
    careerWins,
    winRate,
    rating: jockey.rating || Math.min(5, Math.max(3.5, 4 + winRate / 100)).toFixed(1),
    compatibility: jockey.compatibility || Math.min(99, 80 + Math.round(experience / 2)),
    minWeight: jockey.bodyWeight ? `${jockey.bodyWeight} kg` : "Not provided",
    stableStatus: jockey.stableStatus || "Freelance",
    baseFee: jockey.baseFee || 0,
    prizePercentage: jockey.prizePercentage || 0,
    trophies: jockey.trophies || [],
    availability: jockey.availability || "Available",
    bio: jockey.bio || "No professional biography has been provided.",
    licenseNo: jockey.licenseNo,
    heightCm: jockey.heightCm,
    createdAt: jockey.createdAt,
  };
}

function mapJockeyList(result) {
  return {
    ...result,
    items: result.items.map(mapJockeyToUI),
  };
}

function getJockeyApiParams(params = {}) {
  const sortMap = {
    compatibility: "winCount",
    winRate: "winCount",
    experience: "experienceYrs",
    baseFee: "winCount",
  };

  return {
    fullName: params.search || undefined,
    status:
      params.status === "AVAILABLE"
        ? "ACTIVE"
        : params.status || undefined,
    sortBy: sortMap[params.sortBy] || params.sortBy || "winCount",
    sortDir: params.sortOrder || "desc",
  };
}

function applyClientJockeyFilters(items, params = {}) {
  const query = (params.search || "").trim().toLowerCase();
  const minimumWinRate = Number(params.minWinRate) || 0;
  const ridingStyle = params.ridingStyle || "";
  const status = params.status || "";
  const sortBy = params.sortBy || "compatibility";
  const sortOrder = params.sortOrder || "desc";
  const direction = sortOrder === "asc" ? 1 : -1;

  return items
    .filter(
      (jockey) =>
        (!query ||
          jockey.name.toLowerCase().includes(query) ||
          jockey.email.toLowerCase().includes(query) ||
          jockey.licenseNo?.toLowerCase().includes(query)) &&
        (!status || jockey.status === status) &&
        (!ridingStyle || jockey.ridingStyle === ridingStyle) &&
        jockey.winRate >= minimumWinRate,
    )
    .sort((left, right) => {
      const leftValue = left[sortBy] ?? 0;
      const rightValue = right[sortBy] ?? 0;
      return typeof leftValue === "string"
        ? leftValue.localeCompare(rightValue) * direction
        : (Number(leftValue) - Number(rightValue)) * direction;
    });
}

function paginate(items, page, pageSize) {
  const size = Number(pageSize) || DEFAULT_PAGE_SIZE;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const start = (currentPage - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: currentPage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

export async function getJockeyList(params = {}) {
  const apiParams = getJockeyApiParams(params);
  const endpoint = apiParams.fullName || apiParams.status
    ? `${JOCKEY_ENDPOINT}/filter`
    : JOCKEY_ENDPOINT;
  const data = unwrapResponse(await api.get(endpoint, { params: apiParams }));
  if (!data || typeof data === "string") throw new Error("Invalid jockey response");
  const normalized = mapJockeyList(normalizeListResponse(data, params, ["jockeys"]));
  const filtered = applyClientJockeyFilters(normalized.items, params);
  return paginate(filtered, params.page, params.pageSize);
}

export async function getJockeyDetail(jockeyId) {
  const data = unwrapResponse(await api.get(`${JOCKEY_ENDPOINT}/${jockeyId}`));
  if (!data || typeof data !== "object") throw new Error("Invalid jockey response");
  return mapJockeyToUI(data);
}

export async function sendInvitation(payload) {
  if (!payload.entryId) {
    throw new Error("A race entry is required before sending an invitation.");
  }

  const requestPayload = {
    entryId: payload.entryId,
    jockeyUserId: payload.jockeyUserId || payload.jockeyId,
  };
  return unwrapResponse(await api.post(INVITATION_ENDPOINT, requestPayload));
}

export async function getInvitationList(params = {}) {
  const apiParams = {
    status: params.status || undefined,
    jockeyUserId: params.jockeyId || undefined,
    ownerUserId: params.ownerId || undefined,
    page: Math.max((Number(params.page) || 1) - 1, 0),
    size: params.pageSize || 6,
    sortBy: params.sortBy || "invitedAt",
    sortDir: params.sortOrder || "desc",
  };

  const data = unwrapResponse(
    await api.get(INVITATION_ENDPOINT, { params: apiParams }),
  );
  const result = normalizeListResponse(data, params, ["invitations"]);
  if (!params.search) return result;

  const query = params.search.trim().toLowerCase();
  const items = result.items.filter(
    (invitation) =>
      invitation.raceName?.toLowerCase().includes(query) ||
      invitation.horseName?.toLowerCase().includes(query) ||
      invitation.ownerName?.toLowerCase().includes(query),
  );
  return { ...result, items };
}

export async function acceptInvitation(invitationId) {
  return unwrapResponse(
    await api.patch(`${INVITATION_ENDPOINT}/${invitationId}/accept`),
  );
}

export async function rejectInvitation(invitationId, payload) {
  return unwrapResponse(
    await api.patch(
      `${INVITATION_ENDPOINT}/${invitationId}/reject`,
      payload,
    ),
  );
}

export async function cancelInvitation(invitationId) {
  await api.delete(`${INVITATION_ENDPOINT}/${invitationId}`);
  return true;
}

export const sendJockeyInvitation = sendInvitation;
