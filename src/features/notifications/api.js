import { apiClient } from "@/common/lib/apiClient";

export async function fetchNotifications() {
  const { data } = await apiClient.get("/notifications");
  return data.data ?? [];
}

export async function fetchUnreadCount() {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data.data ?? 0;
}

export async function markNotificationRead(id) {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.patch("/notifications/read-all");
}
