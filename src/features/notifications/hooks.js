import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./api";

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: fetchNotifications,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchUnreadCount,
    enabled,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    // silent-by-design: low-stakes idempotent UI action
    meta: { skipGlobalErrorToast: true },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    // silent-by-design: low-stakes idempotent UI action
    meta: { skipGlobalErrorToast: true },
  });
}
