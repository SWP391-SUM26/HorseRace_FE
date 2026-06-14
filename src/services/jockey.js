import api from "./api";
import invitationMock from "../data/invitationMock.json";
import jockeyMock from "../data/jockeyMock.json";

const JOCKEY_ENDPOINT = "/jockeys";
const INVITATION_ENDPOINT = "/api/v1/assignments/invitations";
const INVITATION_STORAGE_KEY = "equine_elite_jockey_invitations";
const INVITATION_FALLBACK_KEY = "equine_elite_invitation_fallback";
const DEFAULT_PAGE_SIZE = 4;

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data;
}

function getApiMessage(error) {
  return String(
    error?.response?.data?.message || error?.response?.data?.error || "",
  ).toLowerCase();
}

function shouldUseFallback(error, resourcePath = "") {
  if (!error.response || [404, 405, 501].includes(error.response.status)) {
    return true;
  }

  const message = getApiMessage(error);
  return (
    error.response.status === 500 &&
    (message.includes("noresourcefoundexception") ||
      message.includes(`no static resource ${resourcePath}`))
  );
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

function readInvitations() {
  const stored = localStorage.getItem(INVITATION_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(invitationMock));
    return [...invitationMock];
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(invitationMock));
    return [...invitationMock];
  }
}

function writeInvitations(invitations) {
  localStorage.setItem(INVITATION_STORAGE_KEY, JSON.stringify(invitations));
}

function setInvitationFallback(active) {
  localStorage.setItem(INVITATION_FALLBACK_KEY, String(active));
}

function isInvitationFallbackActive() {
  return localStorage.getItem(INVITATION_FALLBACK_KEY) === "true";
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
  const query = search.trim().toLowerCase();
  const minimumWinRate = Number(minWinRate) || 0;

  const filtered = jockeyMock.jockeys
    .filter(
      (jockey) =>
        (!query ||
          jockey.name.toLowerCase().includes(query) ||
          jockey.ridingStyle.toLowerCase().includes(query)) &&
        (!status || jockey.status === status) &&
        (!ridingStyle || jockey.ridingStyle === ridingStyle) &&
        jockey.winRate >= minimumWinRate,
    )
    .sort((left, right) => {
      const leftValue = left[sortBy] ?? 0;
      const rightValue = right[sortBy] ?? 0;
      const direction = sortOrder === "asc" ? 1 : -1;
      return typeof leftValue === "string"
        ? leftValue.localeCompare(rightValue) * direction
        : (leftValue - rightValue) * direction;
    });

  return paginate(filtered, page, pageSize);
}

function getMockInvitationList(params = {}) {
  const {
    search = "",
    status = "",
    jockeyId = "",
    ownerId = "",
    page = 1,
    pageSize = 6,
  } = params;
  const query = search.trim().toLowerCase();
  const invitations = readInvitations();
  const effectiveJockeyId =
    jockeyId &&
    invitations.some(
      (item) => item.jockeyId === jockeyId || item.jockeyUserId === jockeyId,
    )
      ? jockeyId
      : "";
  const effectiveOwnerId =
    ownerId &&
    invitations.some(
      (item) => item.ownerId === ownerId || item.ownerUserId === ownerId,
    )
      ? ownerId
      : "";
  const filtered = invitations
    .filter(
      (invitation) =>
        (!query ||
          invitation.raceName.toLowerCase().includes(query) ||
          invitation.horseName.toLowerCase().includes(query) ||
          invitation.ownerName.toLowerCase().includes(query)) &&
        (!status || invitation.status === status) &&
        (!effectiveJockeyId ||
          invitation.jockeyId === effectiveJockeyId ||
          invitation.jockeyUserId === effectiveJockeyId) &&
        (!effectiveOwnerId ||
          invitation.ownerId === effectiveOwnerId ||
          invitation.ownerUserId === effectiveOwnerId),
    )
    .sort(
      (left, right) =>
        new Date(right.invitedAt).getTime() - new Date(left.invitedAt).getTime(),
    );

  return paginate(filtered, page, pageSize);
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

function updateMockInvitation(invitationId, changes) {
  let updated = null;
  writeInvitations(
    readInvitations().map((invitation) => {
      if (
        invitation.id !== invitationId &&
        invitation.assignmentId !== invitationId
      ) {
        return invitation;
      }
      updated = { ...invitation, ...changes };
      return updated;
    }),
  );
  return updated;
}

export async function getJockeyList(params = {}) {
  try {
    const data = unwrapResponse(await api.get(JOCKEY_ENDPOINT, { params }));
    if (!data || typeof data === "string") throw new Error("Invalid jockey response");
    return normalizeListResponse(data, params, ["jockeys"]);
  } catch (error) {
    if (!shouldUseFallback(error, "jockeys")) throw error;
    return getMockJockeyList(params);
  }
}

export async function getJockeyDetail(jockeyId) {
  try {
    const data = unwrapResponse(await api.get(`${JOCKEY_ENDPOINT}/${jockeyId}`));
    if (!data || typeof data !== "object") throw new Error("Invalid jockey response");
    return data;
  } catch (error) {
    if (!shouldUseFallback(error, "jockeys")) throw error;
    return jockeyMock.jockeys.find((jockey) => jockey.id === jockeyId) ?? null;
  }
}

export async function sendInvitation(payload) {
  try {
    const requestPayload = payload.entryId
      ? { entryId: payload.entryId, jockeyUserId: payload.jockeyId }
      : payload;
    return unwrapResponse(await api.post(INVITATION_ENDPOINT, requestPayload));
  } catch (error) {
    const canUseMock =
      shouldUseFallback(error, "api/v1/assignments/invitations") ||
      [400, 404].includes(error.response?.status);
    if (!canUseMock) throw error;

    const horse = jockeyMock.unassignedHorses.find(
      (item) => item.id === payload.horseId,
    );
    const jockey = jockeyMock.jockeys.find((item) => item.id === payload.jockeyId);
    const invitation = {
      id: `inv_${Date.now()}`,
      assignmentId: `inv_${Date.now()}`,
      ...payload,
      raceName: horse?.race?.name || "Race",
      raceDate: horse?.race?.date || "",
      horseName: horse?.name || "Horse",
      jockeyUserId: payload.jockeyId,
      jockeyName: jockey?.name || "Jockey",
      ownerId: payload.ownerId || "owner_mock",
      ownerUserId: payload.ownerId || "owner_mock",
      ownerName: "Owen Owner",
      status: "INVITED",
      invitedAt: new Date().toISOString(),
    };
    setInvitationFallback(true);
    writeInvitations([invitation, ...readInvitations()]);
    return invitation;
  }
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

  try {
    const data = unwrapResponse(
      await api.get(INVITATION_ENDPOINT, { params: apiParams }),
    );
    const result = normalizeListResponse(data, params, ["invitations"]);
    if (result.totalItems === 0 && isInvitationFallbackActive()) {
      return getMockInvitationList(params);
    }
    if (result.totalItems > 0) setInvitationFallback(false);
    if (!params.search) return result;

    const query = params.search.trim().toLowerCase();
    const items = result.items.filter(
      (invitation) =>
        invitation.raceName?.toLowerCase().includes(query) ||
        invitation.horseName?.toLowerCase().includes(query) ||
        invitation.ownerName?.toLowerCase().includes(query),
    );
    return { ...result, items };
  } catch (error) {
    if (!shouldUseFallback(error, "api/v1/assignments/invitations")) throw error;
    return getMockInvitationList(params);
  }
}

export async function acceptInvitation(invitationId) {
  if (isInvitationFallbackActive()) {
    return updateMockInvitation(invitationId, {
      status: "ACCEPTED",
      respondedAt: new Date().toISOString(),
    });
  }
  try {
    return unwrapResponse(
      await api.patch(`${INVITATION_ENDPOINT}/${invitationId}/accept`),
    );
  } catch (error) {
    if (!shouldUseFallback(error, "api/v1/assignments/invitations")) throw error;
    return updateMockInvitation(invitationId, {
      status: "ACCEPTED",
      respondedAt: new Date().toISOString(),
    });
  }
}

export async function rejectInvitation(invitationId, payload) {
  if (isInvitationFallbackActive()) {
    return updateMockInvitation(invitationId, {
      status: "DECLINED",
      reason: payload.reason,
      respondedAt: new Date().toISOString(),
    });
  }
  try {
    return unwrapResponse(
      await api.patch(
        `${INVITATION_ENDPOINT}/${invitationId}/reject`,
        payload,
      ),
    );
  } catch (error) {
    if (!shouldUseFallback(error, "api/v1/assignments/invitations")) throw error;
    return updateMockInvitation(invitationId, {
      status: "DECLINED",
      reason: payload.reason,
      respondedAt: new Date().toISOString(),
    });
  }
}

export async function cancelInvitation(invitationId) {
  if (isInvitationFallbackActive()) {
    updateMockInvitation(invitationId, {
      status: "CANCELLED",
      respondedAt: new Date().toISOString(),
    });
    return true;
  }
  try {
    await api.delete(`${INVITATION_ENDPOINT}/${invitationId}`);
    return true;
  } catch (error) {
    if (!shouldUseFallback(error, "api/v1/assignments/invitations")) throw error;
    updateMockInvitation(invitationId, {
      status: "CANCELLED",
      respondedAt: new Date().toISOString(),
    });
    return true;
  }
}

export const sendJockeyInvitation = sendInvitation;
