import { Link } from "react-router-dom";
import { PageHeader } from "@/common/components/PageHeader";
import { Button, Skeleton, EmptyState } from "@/common/ui";
import { useAuth } from "@/common/hooks/useAuth";
import { useOwnerOverview } from "../hooks";
import { OverviewKpiGrid } from "../components/OverviewKpiGrid";
import { StableSummary } from "../components/StableSummary";
import { UpcomingRaces } from "../components/UpcomingRaces";
const REGISTER_HORSE_PATH = "/app/owner/stable";
function OwnerOverviewPage() {
  const { user } = useAuth();
  const { data, isPending, isError } = useOwnerOverview();
  return <>
      <PageHeader
    title="Overview"
    subtitle={`Welcome back, ${user?.fullName ?? "Owner"} \u2014 here's your stable at a glance.`}
    actions={<Link to={REGISTER_HORSE_PATH}>
            <Button>Register Horse</Button>
          </Link>}
  />

      {isPending ? <OverviewSkeleton /> : isError || !data ? <EmptyState
    title="Couldn't load your overview"
    description="Please refresh the page to try again."
  /> : <div className="flex flex-col gap-6">
          <OverviewKpiGrid kpis={data.kpis} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StableSummary horses={data.horses} />
            </div>
            <UpcomingRaces races={data.upcomingRaces} />
          </div>
        </div>}
    </>;
}
function OverviewSkeleton() {
  return <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>;
}
export {
  OwnerOverviewPage as default
};
