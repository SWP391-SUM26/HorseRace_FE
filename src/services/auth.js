import authMock from "../data/authMock.json";

const SESSION_KEY = "equine_elite_session";

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

export function loginWithCredentials(identifier, password, rememberMe = false) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = authMock.users.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedIdentifier ||
      candidate.username.toLowerCase() === normalizedIdentifier,
  );

  if (!user || user.password !== password) {
    throw new Error("Email, username or password is incorrect.");
  }

  return persistSession(createSession(user), rememberMe);
}

export function loginWithGoogle() {
  return persistSession(createSession(authMock.googleAccount), true);
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
