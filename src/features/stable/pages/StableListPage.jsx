import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, EmptyState, Skeleton } from "@/common/ui";
import { useOwnerHorses } from "../hooks";
import { HorseCard } from "../components/HorseCard";

export default function StableListPage() {
  const { data, isPending, isError } = useOwnerHorses();

  return (
    <>
      <PageHeader
        title="Stable Management"
        subtitle="Manage your racing stable and horse readiness."
        actions={
          <Link to="/app/owner/stable/new">
            <Button leftIcon={<Plus size={16} />}>Register Horse</Button>
          </Link>
        }
      />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-60 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load stable" description="Please refresh and try again." />
      ) : data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((horse) => (
            <HorseCard key={horse.id} horse={horse} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No horses registered"
          description="Register your first horse to begin managing your stable."
          action={
            <Link to="/app/owner/stable/new">
              <Button>Register Horse</Button>
            </Link>
          }
        />
      )}
    </>
  );
}
