import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/common/lib/cn";
import { formatDate } from "@/common/lib/format";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from "../hooks";
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();
  const list = useNotifications(open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const count = unread.data ?? 0;
  return <div className="relative">
      <button
    type="button"
    aria-label="Notifications"
    onClick={() => setOpen((o) => !o)}
    className="relative text-muted hover:text-ink"
  >
        <Bell size={20} />
        {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>}
      </button>

      {open && <>
          <button
    type="button"
    aria-label="Close notifications"
    className="fixed inset-0 z-40 cursor-default"
    onClick={() => setOpen(false)}
  />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-ink">Notifications</span>
              {count > 0 && <button
    type="button"
    onClick={() => markAll.mutate()}
    className="flex items-center gap-1 text-xs text-brand-700 hover:underline"
  >
                  <CheckCheck size={13} /> Mark all read
                </button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {list.isPending ? <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p> : !list.data || list.data.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p> : <ul>
                  {list.data.map((n) => <li key={n.notificationId}>
                      <button
    type="button"
    onClick={() => {
      if (!n.isRead) markRead.mutate(n.notificationId);
    }}
    className={cn(
      "flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-subtle",
      !n.isRead && "bg-brand-50/40"
    )}
  >
                        <span className="flex items-center gap-2">
                          {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-700" />}
                          <span className="text-sm font-medium text-ink">{n.title}</span>
                        </span>
                        <span className="text-xs text-muted">{n.message}</span>
                        {n.createdAt && <span className="text-[10px] text-muted">{formatDate(n.createdAt)}</span>}
                      </button>
                    </li>)}
                </ul>}
            </div>
            <Link
    to="/app/notifications"
    onClick={() => setOpen(false)}
    className="block border-t border-border px-4 py-3 text-center text-xs font-medium text-brand-700 hover:bg-subtle"
  >
              View all
            </Link>
          </div>
        </>}
    </div>;
}
export {
  NotificationBell
};
