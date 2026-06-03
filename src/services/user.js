import api from "./api";
import DATA_FROM_JSON from "../data/UserMock.json";

const API_ROLE_TO_APP_ROLE = {
  ADMIN: "Admin",
  HORSE_OWNER: "Owner",
  OWNER: "Owner",
  JOCKEY: "Jockey",
  RACE_REFEREE: "Referee",
  SPECTATOR: "Spectator",
};

const EDITED_USERS_KEY = "equine_elite_edited_users";

function getLocalEditedUsers() {
  const raw = localStorage.getItem(EDITED_USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

function mergeEditedUsers(userList) {
  const edited = getLocalEditedUsers();
  return userList.map(u => {
    if (edited[u.id]) {
      return { ...u, ...edited[u.id] };
    }
    return u;
  });
}

// Normalizes API UserResponse to application-wide user structures
function normalizeUser(user) {
  if (!user) return null;
  const appRole = API_ROLE_TO_APP_ROLE[user.roleCode] || user.roleCode || "Spectator";
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return {
    id: user.userId || user.id,
    userId: user.userId || user.id,
    name: user.fullName || user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || null,
    avatar: initials,
    role: appRole,
    roleCode: user.roleCode || user.role || "SPECTATOR",
    roleName: user.roleName || appRole,
    status: user.status || "ACTIVE",
    kycStatus: user.kycStatus || "PENDING",
    stable: user.stable || (appRole === "Owner" ? "Hartwell Racing Syndicate" : "Flemington Pro Circuit"),
    provider: user.provider || "credentials"
  };
}

// Loads local Mock fallback data
function getMockUsers() {
  const raw = localStorage.getItem("equine_elite_mock_users");
  const list = raw ? JSON.parse(raw) : (DATA_FROM_JSON.users || []);
  return list.map(u => normalizeUser(u));
}

// Fetch all users
export async function getAllUsers() {
  let list = [];
  try {
    const response = await api.get("/api/v1/users");
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      list = data.map(u => normalizeUser(u));
    }
  } catch (err) {
    console.warn("API getAllUsers failed, falling back to mock data:", err.message);
    list = getMockUsers();
  }
  if (list.length === 0) {
    list = getMockUsers();
  }
  return mergeEditedUsers(list);
}

// Fetch single user profile by ID
export async function getUserById(id) {
  const edited = getLocalEditedUsers();
  if (edited[id]) {
    return edited[id];
  }
  try {
    const response = await api.get(`/api/v1/users/${id}`);
    const data = response.data?.data || response.data;
    if (data) {
      return normalizeUser(data);
    }
  } catch (err) {
    console.warn(`API getUserById for ${id} failed, falling back to mock data:`, err.message);
  }
  const mockList = getMockUsers();
  const found = mockList.find(u => u.id === id) || null;
  return found;
}

// Update own profile
export async function updateMyProfile(profileData) {
  try {
    const response = await api.put("/api/v1/users/me", {
      fullName: profileData.fullName,
      phone: profileData.phone,
      avatarUrl: profileData.avatarUrl
    });
    const data = response.data?.data || response.data;
    if (data) {
      return normalizeUser(data);
    }
  } catch (err) {
    console.warn("API updateMyProfile failed:", err.message);
    throw err;
  }
}

// Update profile of any user by ID (speculative admin call with fallback)
export async function updateUserProfile(id, profileData) {
  const rawSession = localStorage.getItem("equine_elite_session");
  let currentUserId = "";
  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      currentUserId = session?.user?.id || session?.user?.userId || "";
    } catch (e) {}
  }

  // If editing self, hit PUT /api/v1/users/me
  if (currentUserId && currentUserId === id) {
    try {
      const updatedSelf = await updateMyProfile({
        fullName: profileData.name,
        phone: profileData.phone || "",
        avatarUrl: profileData.avatarUrl || null
      });
      
      const current = getLocalEditedUsers();
      current[id] = updatedSelf;
      localStorage.setItem(EDITED_USERS_KEY, JSON.stringify(current));
      
      return updatedSelf;
    } catch (err) {
      console.error("Failed to update my profile on server:", err);
      throw err;
    }
  }

  // For other users: ONLY perform local mock update in localStorage (don't hit PUT /api/v1/users/{id})
  const existing = await getUserById(id);
  const updated = {
    ...existing,
    id,
    userId: id,
    name: profileData.name,
    fullName: profileData.name,
    email: profileData.email,
    stable: profileData.stable
  };

  const current = getLocalEditedUsers();
  current[id] = updated;
  localStorage.setItem(EDITED_USERS_KEY, JSON.stringify(current));

  return updated;
}
