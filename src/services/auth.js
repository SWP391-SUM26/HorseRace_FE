import authMock from "../data/authMock.json";
import api from "./api";

const SESSION_KEY = "equine_elite_session";
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const MOCK_USERS_KEY = "equine_elite_mock_users";

// Initialize mock users in localStorage if not exists
if (!localStorage.getItem(MOCK_USERS_KEY)) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(authMock.users));
}

export function getLocalMockUsers() {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  return raw ? JSON.parse(raw) : authMock.users;
}

export function saveLocalMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function registerOfflineUser(userData) {
  const users = getLocalMockUsers();
  
  // check if user already exists
  const existing = users.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
  if (existing) {
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === userData.email.trim().toLowerCase()) {
        return {
          ...u,
          password: userData.password || u.password,
          name: userData.fullName || userData.name || u.name,
          phone: userData.phone || userData.contactNumber || u.phone || "",
          stable: userData.stableName || userData.stable || u.stable || "",
        };
      }
      return u;
    });
    saveLocalMockUsers(updatedUsers);
    return updatedUsers.find(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
  }

  const userId = `usr_local_${Date.now()}`;
  const initials = (userData.fullName || userData.name || userData.email)
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";

  const newUser = {
    id: userId,
    userId: userId,
    name: userData.fullName || userData.name || userData.email.split('@')[0],
    email: userData.email.trim().toLowerCase(),
    username: userData.username || userData.email.trim().toLowerCase(),
    password: userData.password,
    role: userData.role || "Spectator",
    avatar: initials,
    stable: userData.stableName || userData.stable || (userData.role === "Owner" ? "Hartwell Racing Syndicate" : "Flemington Pro Circuit"),
    provider: "credentials",
    tokens: {
      accessToken: `mock_access_${userId}`,
      refreshToken: `mock_refresh_${userId}`,
      accessTokenExpiresInSeconds: 900000,
      refreshTokenExpiresInSeconds: 7 * 24 * 60 * 60
    }
  };

  users.push(newUser);
  saveLocalMockUsers(users);
  return newUser;
}

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

// Decode JWT payload to extract any role claims
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
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

// Thử lấy thông tin user từ /api/v1/users/me khi profile thông thường trả về roleCode = null
async function fetchMyProfile(accessToken) {
  try {
    const response = await api.get('/api/v1/users/me', {
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

  // Backend có thể trả về role theo cấu trúc phẳng (roleCode) hoặc object lồng nhau (role.roleCode)
  // Thử tất cả các dạng có thể có:
  let apiRole =
    profile?.roleCode ||           // Dạng phẳng: { roleCode: "ADMIN" }
    profile?.role?.roleCode ||     // Dạng lồng (JPA): { role: { roleCode: "ADMIN" } }
    profile?.role?.code ||         // Dạng alternative: { role: { code: "ADMIN" } }
    authData.roleCode ||           // Từ login response trực tiếp
    authData.role;                 // Cuối cùng

  // Nếu vẫn null, thử giải mã JWT token để lấy role claims
  if (!apiRole) {
    const jwtClaims = decodeJwtPayload(authData.accessToken);
    apiRole = jwtClaims?.role || jwtClaims?.roleCode || jwtClaims?.authorities?.[0];
  }

  // Cuối cùng: thử gọi /api/v1/users/me (một số backend có endpoint này trả về role đầy đủ hơn)
  if (!apiRole) {
    const meProfile = await fetchMyProfile(authData.accessToken);
    apiRole =
      meProfile?.roleCode ||
      meProfile?.role?.roleCode ||
      meProfile?.roleName;
  }

  // Last resort: thử probe admin-only endpoint để tự động detect role
  // Nếu user có thể gọi /api/v1/admin/users thành công → chắc chắn là ADMIN
  if (!apiRole) {
    try {
      const adminProbe = await api.get('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
        params: { page: 0, size: 1 },
      });
      if (adminProbe.status === 200) {
        apiRole = 'ADMIN';
        console.log('[auth] Admin role auto-detected via admin endpoint probe.');
      }
    } catch (probeErr) {
      // 403 = not admin, ignore silently
      if (probeErr?.response?.status !== 403 && probeErr?.response?.status !== 401) {
        // Thử endpoint thay thế
        try {
          const usersProbe = await api.get('/api/v1/users', {
            headers: { Authorization: `Bearer ${authData.accessToken}` },
            params: { page: 0, size: 1 },
          });
          // Nếu response có data và user có VERIFIED KYC + ACTIVE status, kiểm tra thêm
          if (usersProbe.status === 200 && profile?.kycStatus === 'VERIFIED') {
            // Thử xác định qua email pattern (chỉ dùng nếu email có dạng admin.*)
            const emailLocal = authData.email?.split('@')[0]?.toLowerCase();
            if (emailLocal?.startsWith('admin')) {
              apiRole = 'ADMIN';
              console.log('[auth] Admin role detected via email pattern fallback.');
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }


  const appRole = normalizeApiRole(apiRole);

  // Debug: log để kiểm tra cấu trúc backend trả về
  console.log("[auth] Profile from API:", profile);
  console.log("[auth] apiRole resolved:", apiRole, "→ appRole:", appRole);

  const initials = (profile?.fullName || authData.email)
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
      roleName: profile?.roleName || profile?.role?.roleName,
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

  // LUÔN kiểm tra mock users trước - đây là tài khoản "cứng" không phụ thuộc backend
  // Mock users sẽ hoạt động ngay cả khi backend DB bị reset
  const localMockUsers = getLocalMockUsers();
  const mockUser = localMockUsers.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedIdentifier ||
      candidate.username.toLowerCase() === normalizedIdentifier,
  );

  if (mockUser && mockUser.password === password) {
    console.log("[auth] Mock user matched, logging in offline:", mockUser.email);
    return persistSession(createSession(mockUser), rememberMe);
  }

  // Nếu không phải mock user, thử API backend
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
    // Nếu là lỗi xác thực thật (401/403) và không phải mock user → thông báo lỗi
    if (apiError.response && (apiError.response.status === 400 || apiError.response.status === 401 || apiError.response.status === 403)) {
      throw new Error(apiError.response.data?.message || "Email, username or password is incorrect.");
    }
    console.warn("API login failed due to network/server error:", apiError.message);
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
  const localMockUsers = getLocalMockUsers();
  const user = localMockUsers.find((candidate) => candidate.role === role);

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

  const localMockUsers = getLocalMockUsers();
  const account =
    localMockUsers.find((user) => user.id === session.user.id) ||
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
