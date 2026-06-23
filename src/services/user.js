import api from "./api";

const API_ROLE_TO_APP_ROLE = {
  ADMIN: "Admin",
  HORSE_OWNER: "Owner",
  OWNER: "Owner",
  JOCKEY: "Jockey",
  RACE_REFEREE: "Referee",
  SPECTATOR: "Spectator",
};

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

// Fetch all users
export async function getAllUsers() {
  try {
    const response = await api.get("/api/v1/users");
    const data = response.data?.data || response.data;
    if (Array.isArray(data)) {
      return data.map(u => normalizeUser(u));
    }
    return [];
  } catch (err) {
    console.error("API getAllUsers failed:", err.message);
    throw err;
  }
}

// Fetch single user profile by ID
export async function getUserById(id) {
  try {
    const response = await api.get(`/api/v1/users/${id}`);
    const data = response.data?.data || response.data;
    if (data) {
      return normalizeUser(data);
    }
    return null;
  } catch (err) {
    console.error(`API getUserById for ${id} failed:`, err.message);
    throw err;
  }
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
    console.error("API updateMyProfile failed:", err.message);
    throw err;
  }
}

// Update profile of any user by ID (admin call)
export async function updateUserProfile(id, profileData) {
  try {
    const response = await api.put(`/api/v1/users/${id}`, {
      fullName: profileData.name,
      phone: profileData.phone,
      avatarUrl: profileData.avatarUrl
    });
    const data = response.data?.data || response.data;
    if (data) {
      return normalizeUser(data);
    }
  } catch (err) {
    console.error(`API updateUserProfile for ${id} failed:`, err.message);
    throw err;
  }
}

// Get user permissions
export async function getUserPermissions(id) {
  try {
    const response = await api.get(`/api/v1/users/${id}/permissions`);
    return response.data?.data || response.data || [];
  } catch (err) {
    console.error(`API getUserPermissions for ${id} failed:`, err.message);
    return [];
  }
}

export async function uploadAvatar(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/v1/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = response.data?.data || response.data;
    if (data) {
      return normalizeUser(data);
    }
  } catch (err) {
    console.error("API uploadAvatar failed:", err.message);
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    const response = await api.delete(`/api/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
