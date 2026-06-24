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

async function fetchMyProfile(accessToken) {
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
  const profile = await fetchMyProfile(authData.accessToken);
  const apiRole =
    authData.role ||
    profile?.roleCode ||
    profile?.role?.roleCode ||
    profile?.roleName;
  const role = normalizeApiRole(apiRole);
  const displayName = profile?.fullName || authData.email;
  const initials = displayName
    ?.split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    user: {
      id: authData.userId,
      userId: authData.userId,
      name: displayName,
      email: authData.email,
      role,
      apiRole,
      avatar: initials || "US",
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
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function getUserPermissions(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
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

// ==========================================
// REGISTRATION & VERIFICATION
// ==========================================

export async function registerSpectator(data) {
  const response = await api.post("/api/v1/auth/register/spectator", data);
  return response.data;
}

export async function registerOwner(data) {
  const response = await api.post("/api/v1/auth/register/owner", data);
  return response.data;
}

export async function registerJockey(data) {
  const response = await api.post("/api/v1/auth/register/jockey", data);
  return response.data;
}

export async function requestEmailVerification(email) {
  const response = await api.post("/api/v1/auth/verify-email/request", { email });
  return response.data;
}

export async function verifyCode(email, code) {
  const response = await api.post("/api/v1/auth/verify-code", { email, code });
  return response.data;
}

export async function verifyEmail(email, code) {
  const response = await api.post("/api/v1/auth/verify-email", { email, code });
  return response.data; 
}

export async function resendAuthCode(email) {
  const response = await api.post("/api/v1/auth/resend-code", { email });
  return response.data;
}

// ==========================================
// PASSWORD RECOVERY
// ==========================================

export async function forgotPassword(email) {
  const response = await api.post("/api/v1/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(email, code, newPassword) {
  const response = await api.post("/api/v1/auth/reset-password", { email, code, newPassword });
  return response.data;
}
