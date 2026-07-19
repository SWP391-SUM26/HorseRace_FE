import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
} from "@/common/ui";
import { Calendar, Hash, MapPin, Pencil, Trash2, Trophy } from "lucide-react";
import { formatDate } from "@/common/lib/format";
import { useToast } from "@/common/providers/ToastProvider";
import { useAuth } from "@/common/hooks/useAuth";
import { useMyInvitations, useCancelInvitation } from "../hooks";
import { ReassignInvitationModal } from "./ReassignInvitationModal";

const PAGE_SIZE = 4;

const TONE = {
  INVITED: "info",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral",
};
const STATUS_LABEL = {
  INVITED: "Invited",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDate(iso)} · ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** Owner's sent jockey invitations — embedded as a tab in the Jockey Market. */
export function OwnerInvitationsPanel() {
  const { user } = useAuth();
  const { data, isPending, isError } = useMyInvitations(user?.id ?? "");
  const cancel = useCancelInvitation();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Cancelled invitations are treated as deleted — hidden from the list.
  const visible = useMemo(
    () => (data ?? []).filter((i) => i.status !== "CANCELLED"),
    [data],
  );
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages - 1);
  const paged = visible.slice(
    pageClamped * PAGE_SIZE,
    pageClamped * PAGE_SIZE + PAGE_SIZE,
  );

  function confirmDelete() {
    if (!deleting) return;
    cancel.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Invitation deleted");
        setDeleting(null);
      },
    });
  }

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError)
    return (
      <EmptyState
        title="Couldn't load invitations"
        description="Please try again."
      />
    );
  if (visible.length === 0) {
    return (
      <EmptyState
        title="No invitations sent yet"
        description="Invite a jockey from the Find Jockeys tab to see it here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {paged.map((inv) => (
          <InvitationCard
            key={inv.id}
            inv={inv}
            onEdit={() => setEditing(inv)}
            onDelete={() => setDeleting(inv)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              size="sm"
              variant={pageClamped === i ? "primary" : "ghost"}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {editing && (
        <ReassignInvitationModal
          invitation={editing}
          onClose={() => setEditing(null)}
        />
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete invitation?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Delete the invitation sent to{" "}
          <span className="font-medium text-ink">{deleting?.jockey}</span>? This
          cancels the invitation.
        </p>
      </Modal>
    </div>
  );
}

function InvitationCard({ inv, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar name={inv.jockey} src={inv.jockeyAvatarUrl} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-ink">{inv.jockey}</h3>
          <span className="text-xs text-muted">Jockey</span>
        </div>
        <Badge tone={TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3 text-sm">
        <Row
          icon={<Trophy className="h-3.5 w-3.5" />}
          label="Tournament"
          value={inv.tournament}
        />
        <Row
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Race"
          value={inv.race}
        />
        <Row
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Race time"
          value={fmtDateTime(inv.scheduledStartAt)}
        />
        <Row
          icon={<Hash className="h-3.5 w-3.5" />}
          label="Horse"
          value={`${inv.horse} · #${inv.horseCode}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          Invited {formatDate(inv.invitedAt)}
        </span>
        {inv.status === "INVITED" && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger hover:bg-danger/10"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted">{icon}</span>
      <span className="text-muted">{label}</span>
      <span className="ml-auto truncate font-medium text-ink">{value}</span>
    </div>
  );
}
