import { PageHeader } from '@/common/components/PageHeader';
import { Button, Badge, DataTable, Skeleton, EmptyState, Avatar, type Column } from '@/common/ui';
import { formatDate } from '@/common/lib/format';
import { useToast } from '@/common/providers/ToastProvider';
import { useMyInvitations, useCancelInvitation } from '../hooks_owner';
import type { Invitation, InvitationStatus } from '../types_owner';

const TONE: Record<InvitationStatus, 'info' | 'success' | 'danger' | 'neutral'> = {
  INVITED: 'info', ACCEPTED: 'success', DECLINED: 'danger', CANCELLED: 'neutral',
};

export default function MyInvitationsPage() {
  const { data, isPending, isError } = useMyInvitations();
  const cancel = useCancelInvitation();
  const toast = useToast();

  const columns: Column<Invitation>[] = [
    { key: 'jockey', header: 'Nài', render: (i) => (
      <span className="flex items-center gap-2">
        <Avatar name={i.jockey} src={i.jockeyAvatarUrl} size={28} />
        <span className="font-medium text-ink">{i.jockey}</span>
      </span>
    ) },
    { key: 'horse', header: 'Ngựa', render: (i) => i.horse },
    { key: 'race', header: 'Cuộc đua', render: (i) => i.race },
    { key: 'invitedAt', header: 'Ngày mời', render: (i) => formatDate(i.invitedAt) },
    { key: 'status', header: 'Trạng thái', render: (i) => <Badge tone={TONE[i.status]}>{i.status}</Badge> },
    { key: 'actions', header: '', className: 'text-right', render: (i) =>
      i.status === 'INVITED' ? (
        <Button size="sm" variant="ghost" loading={cancel.isPending}
          onClick={() => cancel.mutate(i.id, {
            onSuccess: () => toast.success('Đã huỷ lời mời'),
            onError: () => toast.error('Huỷ thất bại'),
          })}>Huỷ</Button>
      ) : null },
  ];

  return (
    <>
      <PageHeader title="Lời mời nài" subtitle="Các lời mời bạn đã gửi tới nài." />
      {isPending ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError ? (
        <EmptyState title="Không tải được lời mời" description="Vui lòng thử lại." />
      ) : data && data.length > 0 ? (
        <DataTable rows={data} columns={columns} rowKey={(i) => i.id} />
      ) : (
        <EmptyState title="Chưa gửi lời mời nào" description="Vào Jockey Market để mời nài cho ngựa của bạn." />
      )}
    </>
  );
}
