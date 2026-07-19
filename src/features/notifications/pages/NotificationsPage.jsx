import { CheckCheck } from "lucide-react";
import { Button, Card, EmptyState, Skeleton } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import { formatDate } from "@/common/lib/format";
import { cn } from "@/common/lib/cn";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks";

/**
 * Full-page Notifications Center — shared by every authenticated role
 * (reached from the bell).
 */
export default function NotificationsPage() {
  const list = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = list.data ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Stay on top of approvals, payouts and race updates."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckCheck size={15} />}
            disabled={!hasUnread || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        }
      />

      {list.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : list.isError ? (
        <Card className="p-0">
          <EmptyState
            title="Couldn't load notifications"
            description="Something went wrong reaching the server — please retry."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => list.refetch()}
              >
                Retry
              </Button>
            }
          />
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            title="No notifications yet"
            description="You're all caught up — new alerts will show up here."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((n) => (
            <li key={n.notificationId}>
              <button
                type="button"
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n.notificationId);
                }}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-2xl border border-border p-4 text-left transition-colors",
                  n.isRead
                    ? "bg-surface hover:bg-subtle"
                    : "bg-brand-50/40 hover:bg-brand-50",
                )}
              >
                <span className="flex items-center gap-2">
                  {!n.isRead && (
                    <span
                      aria-label="Unread"
                      className="h-2 w-2 shrink-0 rounded-full bg-brand-700"
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      n.isRead
                        ? "font-medium text-ink"
                        : "font-semibold text-ink",
                    )}
                  >
                    {n.title}
                  </span>
                  {n.createdAt && (
                    <span className="ml-auto shrink-0 text-xs text-muted">
                      {formatDate(n.createdAt)}
                    </span>
                  )}
                </span>
                <span className="text-sm text-muted">{n.message}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
