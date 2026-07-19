import { apiClient } from "@/common/lib/apiClient";
import { mapUser } from "@/common/lib/userApi";

export function toProfileRequest(v) {
  const phone = v.phone.trim();
  return {
    fullName: v.fullName.trim(),
    phone: phone === "" ? undefined : phone,
  };
}

export async function updateProfile(values) {
  const { data } = await apiClient.put("/users/me", toProfileRequest(values));
  return mapUser(data.data);
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/users/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapUser(data.data);
}
