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
  Admin: ["dashboard:view", "users:manage"],
  Owner: ["dashboard:view", "horses:manage", "finance:view", "reports:view"],
  Jockey: [
    "dashboard:view",
    "rides:view",
    "schedule:manage",
    "performance:view",
  ],
  Referee: ["dashboard:view", "races:manage", "reports:manage"],
  Spectator: [
    "dashboard:view",
    "races:view",
    "predictions:view",
    "streams:view",
  ],
};

function normalizeApiRole(roleCode) {
  return API_ROLE_TO_APP_ROLE[roleCode] || roleCode || "Spectator";
}

function getApiErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function persistSession(session, rememberMe = false) {
  const storedSession = { ...session, rememberMe };
  localStorage.setItem(SESSION_KEY, JSON.stringify(storedSession));
  return storedSession;
}

function getInitials(displayName) {
  return displayName
    ?.split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildUserFromProfile(profile, fallbackUser = {}) {
  const apiRole =
    profile?.roleCode ||
    profile?.role?.roleCode ||
    profile?.roleName ||
    fallbackUser.apiRole ||
    fallbackUser.role;
  const role = normalizeApiRole(apiRole);
  const displayName =
    profile?.fullName ||
    fallbackUser.name ||
    profile?.email ||
    fallbackUser.email ||
    "User";

  return {
    ...fallbackUser,
    id: profile?.userId || fallbackUser.id || fallbackUser.userId,
    userId: profile?.userId || fallbackUser.userId || fallbackUser.id,
    userCode: profile?.userCode || fallbackUser.userCode,
    name: displayName,
    email: profile?.email || fallbackUser.email,
    phone: profile?.phone || fallbackUser.phone,
    avatarUrl: profile?.avatarUrl || fallbackUser.avatarUrl,
    avatar: fallbackUser.avatar || getInitials(displayName) || "US",
    status: profile?.status || fallbackUser.status,
    kycStatus: profile?.kycStatus || fallbackUser.kycStatus,
    role,
    apiRole,
    roleName: profile?.roleName || fallbackUser.roleName,
  };
}

export async function fetchCurrentUserProfile(accessToken) {
  try {
    const response = await api.get("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data?.data || null;
  } catch {
    return null;
  }
}

async function buildSessionFromAuthData(authData) {
  const profile = await fetchCurrentUserProfile(authData.accessToken);
  const user = buildUserFromProfile(profile, {
    id: authData.userId,
    userId: authData.userId,
    email: authData.email,
    apiRole: authData.role,
  });

  return {
    user,
    permissions: getUserPermissions(user),
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
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getUserPermissions(userOrRole) {
  const role =
    typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return ROLE_PERMISSIONS[role] || [];
}

export function getCurrentUserPermissions() {
  return getUserPermissions(getStoredSession()?.user);
}

export function hasPermission(permission) {
  return getCurrentUserPermissions().includes(permission);
}

export function validateSession(requiredRoles = []) {
  const session = getStoredSession();
  const now = Date.now();

  if (
    !session?.user ||
    !session.accessToken ||
    !session.refreshToken ||
    session.refreshTokenExpiresAt <= now
  ) {
    return {
      isAuthenticated: false,
      isAuthorized: false,
      session: null,
      reason: "SESSION_EXPIRED",
    };
  }

  if (session.accessTokenExpiresAt <= now) {
    return {
      isAuthenticated: false,
      isAuthorized: false,
      session: null,
      reason: "ACCESS_TOKEN_EXPIRED",
    };
  }

  const allowedRoles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];
  const isAuthorized =
    allowedRoles.length === 0 || allowedRoles.includes(session.user.role);

  return {
    isAuthenticated: true,
    isAuthorized,
    session,
    reason: isAuthorized ? "OK" : "ROLE_NOT_ALLOWED",
  };
}

export async function validateSessionWithApi(requiredRoles = []) {
  let session = getStoredSession();
  const now = Date.now();

  if (
    !session?.user ||
    !session.accessToken ||
    !session.refreshToken ||
    session.refreshTokenExpiresAt <= now
  ) {
    localStorage.removeItem(SESSION_KEY);
    return {
      isAuthenticated: false,
      isAuthorized: false,
      session: null,
      reason: "SESSION_EXPIRED",
    };
  }

  if (session.accessTokenExpiresAt <= now) {
    try {
      session = await refreshAccessToken();
    } catch {
      return {
        isAuthenticated: false,
        isAuthorized: false,
        session: null,
        reason: "TOKEN_REFRESH_FAILED",
      };
    }
  }

  try {
    const profile = await fetchCurrentUserProfile(session.accessToken);
    const isInactive = ["INACTIVE", "BANNED", "SUSPENDED"].includes(
      profile?.status,
    );

    if (!profile || isInactive) {
      localStorage.removeItem(SESSION_KEY);
      return {
        isAuthenticated: false,
        isAuthorized: false,
        session: null,
        reason: "USER_NOT_ACTIVE",
      };
    }

    const user = buildUserFromProfile(profile, session.user);
    const syncedSession = persistSession(
      {
        ...session,
        user,
        permissions: getUserPermissions(user),
      },
      session.rememberMe,
    );
    const allowedRoles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    const isAuthorized =
      allowedRoles.length === 0 || allowedRoles.includes(user.role);

    return {
      isAuthenticated: true,
      isAuthorized,
      session: syncedSession,
      reason: isAuthorized ? "OK" : "ROLE_NOT_ALLOWED",
    };
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return {
      isAuthenticated: false,
      isAuthorized: false,
      session: null,
      reason: "API_SESSION_INVALID",
    };
  }
}

export async function loginWithCredentials(
  identifier,
  password,
  rememberMe = false,
) {
  try {
    const response = await api.post("/api/v1/auth/login", {
      email: identifier.trim().toLowerCase(),
      password,
    });
    const authData = response.data?.data;

    if (!response.data?.success || !authData?.accessToken) {
      throw new Error(response.data?.message || "Login failed.");
    }

    const session = await buildSessionFromAuthData(authData);
    return persistSession(session, rememberMe);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Email or password is incorrect."),
      { cause: error },
    );
  }
}

export async function loginWithGoogle(idToken) {
  if (!idToken) {
    throw new Error("Google ID token is missing.");
  }

  try {
    const response = await api.post("/api/v1/auth/google", { idToken });
    const authData = response.data?.data;

    if (!response.data?.success || !authData?.accessToken) {
      throw new Error(response.data?.message || "Google login failed.");
    }

    const session = await buildSessionFromAuthData(authData);
    return persistSession(session, true);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Unable to sign in with Google."),
      { cause: error },
    );
  }
}

export async function refreshAccessToken() {
  const session = getStoredSession();

  if (!session?.refreshToken) {
    throw new Error("Refresh token is missing.");
  }

  try {
    const response = await api.post("/api/v1/auth/refresh", {
      refreshToken: session.refreshToken,
    });
    const authData = response.data?.data;

    if (!response.data?.success || !authData?.accessToken) {
      throw new Error(response.data?.message || "Token refresh failed.");
    }

    const nextSession = await buildSessionFromAuthData(authData);
    return persistSession(nextSession, session.rememberMe);
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    throw new Error(getApiErrorMessage(error, "Token refresh failed."), {
      cause: error,
    });
  }
}

export function logout() {
  const refreshToken = getStoredSession()?.refreshToken;
  localStorage.removeItem(SESSION_KEY);

  if (refreshToken) {
    api.post("/api/v1/auth/logout", { refreshToken }).catch(() => {});
  }
}
