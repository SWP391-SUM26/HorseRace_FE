import { apiClient } from '@/common/lib/apiClient';

export interface AppNotification {
  notificationId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | null;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<{ data: AppNotification[] | null }>('/notifications');
  return data.data ?? [];
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ data: number | null }>('/notifications/unread-count');
  return data.data ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
