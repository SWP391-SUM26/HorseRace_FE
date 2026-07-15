import { Link } from "react-router-dom";
import { Trophy, Flag, UserCog, Users, ClipboardList, ChevronRight, Wallet } from "lucide-react";
import { Card, StatCard, Skeleton } from "@/common/ui";
import { PageHeader } from "@/common/components/PageHeader";
import {
  useRaceStats,
  useRegistrationStats,
  useStaffingDashboard,
  useUserStats,
  useTournaments,
  useWithdrawals
} from "../hooks";
function Kpi({
  label,
  icon,
  pending,
  error,
  value,
  hint
}) {
  if (pending) {
    return <Card className="p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-16" />
      </Card>;
  }
  return <StatCard label={label} icon={icon} value={error ? "\u2014" : value} hint={error ? void 0 : hint} />;
}
function AdminDashboardPage() {
  const raceStats = useRaceStats();
  const regStats = useRegistrationStats();
  const staffing = useStaffingDashboard();
  const userStats = useUserStats();
  const tournaments = useTournaments({});
  const withdrawals = useWithdrawals({});
  const sections = [
    { label: "Tournaments", description: "Create, publish and orchestrate tournaments", to: "/admin/tournaments", icon: <Trophy size={18} /> },
    { label: "Race Calendar", description: "Schedule and manage races", to: "/admin/races", icon: <Flag size={18} /> },
    { label: "Staffing", description: "Assign referees to races", to: "/admin/staffing", icon: <UserCog size={18} /> },
    { label: "User Management", description: "Owners, jockeys, referees and admins", to: "/admin/users", icon: <Users size={18} /> },
    { label: "Registration Approval", description: "Review horse race registrations", to: "/admin/race-approval", icon: <ClipboardList size={18} /> },
    { label: "Withdrawals", description: "Review spectator withdrawal requests", to: "/admin/withdrawals", icon: <Wallet size={18} /> }
  ];
  return <div className="flex flex-col gap-6">
      <PageHeader title="Admin Dashboard" subtitle="Cross-domain overview of the racing operation." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi
    label="Tournaments"
    icon={<Trophy size={18} />}
    pending={tournaments.isPending}
    error={tournaments.isError}
    value={tournaments.data?.total ?? 0}
  />
        <Kpi
    label="Total Races"
    icon={<Flag size={18} />}
    pending={raceStats.isPending}
    error={raceStats.isError}
    value={raceStats.data?.total ?? 0}
    hint={<span className="text-muted">{raceStats.data?.scheduled ?? 0} scheduled · {raceStats.data?.active ?? 0} active</span>}
  />
        <Kpi
    label="Registrations"
    icon={<ClipboardList size={18} />}
    pending={regStats.isPending}
    error={regStats.isError}
    value={regStats.data?.total ?? 0}
    hint={<span className="text-warning">{regStats.data?.pending ?? 0} pending review</span>}
  />
        <Kpi
    label="Unassigned Races"
    icon={<UserCog size={18} />}
    pending={staffing.isPending}
    error={staffing.isError}
    value={staffing.data?.unassignedRaces ?? 0}
    hint={<span className="text-muted">{staffing.data?.availableReferees ?? 0} referees available</span>}
  />
        <Kpi
    label="Users"
    icon={<Users size={18} />}
    pending={userStats.isPending}
    error={userStats.isError}
    value={userStats.data?.totalUsers ?? 0}
  />
        <Kpi
    label="Withdrawals"
    icon={<Wallet size={18} />}
    pending={withdrawals.isPending}
    error={withdrawals.isError}
    value={withdrawals.data?.total ?? 0}
    hint={<span className="text-warning">pending review</span>}
  />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => <Link key={s.to} to={s.to} className="group">
            <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                {s.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{s.label}</span>
                <span className="block truncate text-sm text-muted">{s.description}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>)}
      </div>
    </div>;
}
export {
  AdminDashboardPage as default
};
