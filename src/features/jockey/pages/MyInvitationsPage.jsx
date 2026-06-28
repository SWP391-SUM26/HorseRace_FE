import { PageHeader } from "@/common/components/PageHeader";
import { Button, Badge, DataTable, Skeleton, EmptyState, Avatar } from "@/common/ui";
import { formatDate } from "@/common/lib/format";
import { useToast } from "@/common/providers/ToastProvider";
import { useMyInvitations, useCancelInvitation } from "../hooks_owner";
const TONE = {
  INVITED: "info",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral"
};
function MyInvitationsPage() {
  const { data, isPending, isError } = useMyInvitations();
  const cancel = useCancelInvitation();
  const toast = useToast();
  const columns = [
    { key: "jockey", header: "N\xE0i", render: (i) => <span className="flex items-center gap-2">
        <Avatar name={i.jockey} src={i.jockeyAvatarUrl} size={28} />
        <span className="font-medium text-ink">{i.jockey}</span>
      </span> },
    { key: "horse", header: "Ng\u1EF1a", render: (i) => i.horse },
    { key: "race", header: "Cu\u1ED9c \u0111ua", render: (i) => i.race },
    { key: "invitedAt", header: "Ng\xE0y m\u1EDDi", render: (i) => formatDate(i.invitedAt) },
    { key: "status", header: "Tr\u1EA1ng th\xE1i", render: (i) => <Badge tone={TONE[i.status]}>{i.status}</Badge> },
    { key: "actions", header: "", className: "text-right", render: (i) => i.status === "INVITED" ? <Button
      size="sm"
      variant="ghost"
      loading={cancel.isPending}
      onClick={() => cancel.mutate(i.id, {
        onSuccess: () => toast.success("\u0110\xE3 hu\u1EF7 l\u1EDDi m\u1EDDi"),
        onError: () => toast.error("Hu\u1EF7 th\u1EA5t b\u1EA1i")
      })}
    >Huỷ</Button> : null }
  ];
  return <>
      <PageHeader title="Lời mời nài" subtitle="Các lời mời bạn đã gửi tới nài." />
      {isPending ? <Skeleton className="h-64 w-full rounded-2xl" /> : isError ? <EmptyState title="Không tải được lời mời" description="Vui lòng thử lại." /> : data && data.length > 0 ? <DataTable rows={data} columns={columns} rowKey={(i) => i.id} /> : <EmptyState title="Chưa gửi lời mời nào" description="Vào Jockey Market để mời nài cho ngựa của bạn." />}
    </>;
}
export {
  MyInvitationsPage as default
};
