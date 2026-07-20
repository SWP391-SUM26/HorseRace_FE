import { apiClient } from "./apiClient";
function mapUser(raw) {
  return {
    id: raw.userId,
    email: raw.email,
    fullName: raw.fullName,
    role: raw.roleCode,
    phone: raw.phone ?? null,
    avatarUrl: raw.avatarUrl ?? null
  };
}
async function fetchMe() {
  const { data } = await apiClient.get("/users/me");
  return mapUser(data.data);
}
export {
  fetchMe,
  mapUser
};
