import authMock from "../data/authMock.json";
import api from "./api";

const SESSION_KEY = "equine_elite_session";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const API_ROLE_TO_APP_ROLE = {
  ADMIN: "Admin",
  HORSE_OWNER: "Owner",
  OWNER: "Owner",
  JOCKEY: "Jockey",
  RACE_REFEREE: "Referee",
  SPECTATOR: "Spectator",
};

export const ROLE_PERMISSIONS = {
  Owner: [
    "dashboard:view",
    "horses:manage",
    "finance:view",
    "reports:view",
  ],
  Jockey: [
    "dashboard:view",
    "rides:view",
    "schedule:manage",
    "performance:view",
  ],
  Spectator: [
    "dashboard:view",
    "races:view",
    "predictions:view",
    "streams:view",
  ],
};
 
function createAccessToken(prefix, userId, expiresInSeconds) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const randomPart = Math.random().toString(36).slice(2);

  return {
    token: `${prefix}_${userId}_${randomPart}`,
    expiresAt,
  };
}

function createSession(user) {
  const { accessToken, refreshToken, accessTokenExpiresInSeconds, refreshTokenExpiresInSeconds } =
    user.tokens;
  const safeUser = { ...user };

  delete safeUser.password;
  delete safeUser.tokens;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: Date.now() + accessTokenExpiresInSeconds * 1000,
    refreshTokenExpiresAt: Date.now() + refreshTokenExpiresInSeconds * 1000,
  };
}

function persistSession(session, rememberMe = false) {
  const sessionToStore = {
    ...session,
    rememberMe,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionToStore));

  return sessionToStore;
}

function normalizeApiRole(roleCode) {
  return API_ROLE_TO_APP_ROLE[roleCode] || roleCode || "Spectator";
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to connect to the authentication server."
  );
}

async function fetchUserProfile(userId, accessToken) {
  if (!userId) {
    return null;
  }

  try {
    const response = await api.get(`/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data?.data || null;
  } catch {
    return null;
  }
}

async function buildSessionFromAuthData(authData) {
  const profile = await fetchUserProfile(authData.userId, authData.accessToken);
  const apiRole = profile?.roleCode || authData.role;
  const appRole = normalizeApiRole(apiRole);
  const initials = profile?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    user: {
      id: authData.userId,
      userId: authData.userId,
      name: profile?.fullName || authData.email,
      email: authData.email,
      role: appRole,
      apiRole,
      roleName: profile?.roleName,
      avatar: initials,
    },
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
    tokenType: authData.tokenType || "Bearer",
    accessTokenExpiresAt: Date.now() + authData.expiresInSeconds * 1000,
    refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
  };
}

export function getStoredSession() {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    return null;
  }
}

export function getUserPermissions(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;

  return ROLE_PERMISSIONS[role] || [];
}

export function getCurrentUserPermissions() {
  const session = getStoredSession();

  if (!session?.user) {
    return [];
  }

  return getUserPermissions(session.user);
}

export function hasPermission(permission) {
  return getCurrentUserPermissions().includes(permission);
}

export function validateSession(requiredRoles = []) {
  let session = getStoredSession();

  if (!session?.user || !session.refreshTokenExpiresAt || session.refreshTokenExpiresAt <= Date.now()) {
    return {
      isAuthenticated: false,
      isAuthorized: false,
      session: null,
      reason: "SESSION_EXPIRED",
    };
  }

  if (session.accessTokenExpiresAt <= Date.now()) {
    try {
      session = refreshAccessToken();
    } catch {
      return {
        isAuthenticated: false,
        isAuthorized: false,
        session: null,
        reason: "TOKEN_REFRESH_FAILED",
      };
    }
  }
  const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(session.user.role);

  return {
    isAuthenticated: true,
    isAuthorized,
    session,
    reason: isAuthorized ? "OK" : "ROLE_NOT_ALLOWED",
  };
}
export async function loginWithCredentials(identifier, password, rememberMe = false) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  try {
    const response = await api.post("/v1/auth/login", {
      email: normalizedIdentifier,
      password,
    });

    const authData = response.data?.data;

    if (response.data?.success && authData?.accessToken) {
      const session = await buildSessionFromAuthData(authData);
      return persistSession(session, rememberMe);
    }
  } catch (apiError) {
    console.warn("API login failed, falling back to mock credentials check:", apiError.message);
  }

  // Fallback to local authMock users for development and mock login support
  const user = authMock.users.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedIdentifier ||
      candidate.username.toLowerCase() === normalizedIdentifier,
  );

  if (user && user.password === password) {
    return persistSession(createSession(user), rememberMe);
  }

  throw new Error("Email, username or password is incorrect.");
}

export async function loginWithGoogle(idToken) {
  if (!idToken) {
    throw new Error("Google ID token is missing.");
  }

  try {
    const response = await api.post("/v1/auth/google", {
      idToken,
    });

    const authData = response.data?.data;

    if (!response.data?.success || !authData?.accessToken) {
      throw new Error(response.data?.message || "Google login failed.");
    }

    const session = await buildSessionFromAuthData(authData);

    return persistSession(session, true);
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

export function loginWithRole(role) {
  const user = authMock.users.find((candidate) => candidate.role === role);

  if (!user) {
    throw new Error("Selected role account is not available.");
  }

  return persistSession(createSession(user), true);
}

export function refreshAccessToken() {
  const session = getStoredSession();

  if (!session || session.refreshTokenExpiresAt <= Date.now()) {
    throw new Error("Refresh token is missing or expired.");
  }

  const account =
    authMock.users.find((user) => user.id === session.user.id) ||
    (authMock.googleAccount.id === session.user.id ? authMock.googleAccount : null);

  if (!account) {
    throw new Error("User session is invalid.");
  }
  const accessToken = createAccessToken(
    account.tokens.accessToken,
    session.user.id,
    account.tokens.accessTokenExpiresInSeconds,
  );
  const nextSession = {
    ...session,
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));

  return nextSession;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
