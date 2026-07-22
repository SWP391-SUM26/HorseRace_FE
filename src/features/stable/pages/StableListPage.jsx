import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, Skeleton, EmptyState } from "@/common/ui";
import { byName } from "@/common/lib/sort";
import { useOwnerHorses } from "../hooks";
import { HorseCard } from "../components/HorseCard";

export default function StableListPage() {
  const { data, isPending, isError } = useOwnerHorses();
  return (
    <>
      <PageHeader
        title="Stable Management"
        subtitle="Quản lý đàn ngựa của bạn."
        actions={
          <Link to="/owner/stable/new">
            <Button leftIcon={<Plus size={16} />}>Register Horse</Button>
          </Link>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Không tải được danh sách ngựa"
          description="Vui lòng thử lại."
        />
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...data].sort(byName("name")).map((h) => (
            <HorseCard key={h.id} horse={h} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có ngựa nào"
          description="Đăng ký con ngựa đầu tiên để bắt đầu."
          action={
            <Link to="/owner/stable/new">
              <Button>Register Horse</Button>
            </Link>
          }
        />
      )}
    </>
  );
}
