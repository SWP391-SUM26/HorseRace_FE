import { Trophy } from "lucide-react";
import { Avatar, Badge, Modal, Skeleton } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useUserHorses, useUserWins } from "../hooks";
import { USER_STATUS_TONE } from "../constants";
function Field({ label, value }) {
  return <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "\u2014"}</p>
    </div>;
}
function UserDetailModal({ user, onClose }) {
  const horsesQuery = useUserHorses(user.userId);
  const winsQuery = useUserWins(user.userId);
  const horses = horsesQuery.data ?? [];
  const wins = winsQuery.data ?? [];
  return <Modal open onClose={onClose} size="lg" title="User Detail">
      <div className="flex flex-col gap-5">
        {
    /* Identity */
  }
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={user.fullName} src={user.avatarUrl ?? void 0} size={56} />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-ink">{user.fullName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="info">{user.roleName ?? user.roleCode}</Badge>
              {user.status && <Badge tone={USER_STATUS_TONE[user.status.toUpperCase()] ?? "neutral"}>{user.status}</Badge>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone || "\u2014"} />
          <Field label="User code" value={user.userCode} />
          <Field label="Joined" value={user.createdAt ? formatDate(user.createdAt) : "\u2014"} />
        </div>

        {
    /* Horses */
  }
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Horses {horses.length > 0 ? `(${horses.length})` : ""}</p>
          {horsesQuery.isPending ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div> : horses.length === 0 ? <p className="text-sm text-muted">This user owns no horses.</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {horses.map((h) => <div key={h.horseId} className="overflow-hidden rounded-xl border border-border">
                  <div className="h-20 w-full bg-subtle">
                    {h.imageUrl && <img src={h.imageUrl} alt={h.name} className="h-20 w-full object-cover" onError={(e) => {
    e.currentTarget.style.display = "none";
  }} />}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium text-ink">{h.name}</p>
                    <p className="truncate text-xs text-muted">{h.breed ?? "\u2014"}{h.status ? ` \xB7 ${h.status}` : ""}</p>
                  </div>
                </div>)}
            </div>}
        </div>

        {
    /* Wins */
  }
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Wins {wins.length > 0 ? `(${wins.length})` : ""}</p>
          {winsQuery.isPending ? <div className="flex flex-col gap-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : winsQuery.isError ? <p className="text-sm text-muted">Couldn't load wins.</p> : wins.length === 0 ? <p className="text-sm text-muted">No race wins yet.</p> : <ul className="flex flex-col gap-2">
              {wins.map((w, i) => <li key={`${w.raceId}-${i}`} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                  <Trophy size={16} className="shrink-0 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{w.raceName ?? "\u2014"} <span className="font-normal text-muted">· {w.horseName ?? "\u2014"}</span></p>
                    <p className="truncate text-xs text-muted">{w.tournamentName ?? "\u2014"}{w.scheduledStartAt ? ` \xB7 ${formatDate(w.scheduledStartAt)}` : ""}</p>
                  </div>
                  {w.prizeEarned != null && w.prizeEarned > 0 && <span className="shrink-0 text-sm font-medium text-brand-700">${w.prizeEarned.toLocaleString()}</span>}
                </li>)}
            </ul>}
        </div>
      </div>
    </Modal>;
}
export {
  UserDetailModal
};
