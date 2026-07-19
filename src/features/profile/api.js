import { apiClient } from "@/common/lib/apiClient";
import { mapUser } from "@/common/lib/userApi";
function toProfileRequest(v) {
  const phone = v.phone.trim();
  return { fullName: v.fullName.trim(), phone: phone === "" ? void 0 : phone };
}
async function updateProfile(values) {
  const { data } = await apiClient.put("/users/me", toProfileRequest(values));
  return mapUser(data.data);
}
async function uploadAvatar(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return mapUser(data.data);
}
export {
  toProfileRequest,
  updateProfile,
  uploadAvatar
};
