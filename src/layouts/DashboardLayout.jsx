import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import {
  BarChartIcon,
  CalendarIcon,
  CheckSquareIcon,
  ClipboardIcon,
  JockeyIcon,
  TrophyIcon,
  BellIcon,
} from "../components/ui/Icons";
import { getUserPermissions, logout } from "../services/auth";
import styles from "./DashboardLayout.module.css";

const roleNavItems = {
  Owner: [
    { label: "Overview", path: "/owner-dashboard", icon: BarChartIcon, end: true },
    { label: "Stable Management", path: "/owner-dashboard/stable", icon: ClipboardIcon, permission: "horses:manage" },
    { label: "Jockey Market", path: "/owner/jockey-market", icon: JockeyIcon },
    { label: "Race Calendar", path: "/owner-dashboard/calendar", icon: CalendarIcon },
    { label: "Financials", path: "/owner-dashboard/financials", icon: TrophyIcon, permission: "finance:view" },
    { label: "Notifications", path: "/owner-dashboard/notifications", icon: BellIcon },
  ],
  Jockey: [
    { label: "Overview", path: "/jockey-dashboard", icon: BarChartIcon, end: true },
    { label: "Invitations", path: "/jockey/invitations", icon: ClipboardIcon },
    { label: "Ride Schedule", path: "/jockey-dashboard", icon: CalendarIcon, permission: "schedule:manage", end: true },
    { label: "Performance", path: "/jockey-dashboard", icon: TrophyIcon, permission: "performance:view", end: true },
    { label: "Notifications", path: "/jockey/notifications", icon: BellIcon },
  ],
  Spectator: [
    { label: "Overview", path: "/spectator-dashboard", icon: BarChartIcon, end: true },
    { label: "Live Races", path: "/spectator-dashboard", icon: CalendarIcon, permission: "races:view", end: true },
    { label: "Predictions", path: "/spectator-dashboard", icon: CheckSquareIcon, permission: "predictions:view", end: true },
    { label: "Notifications", path: "/spectator/notifications", icon: BellIcon },
  ],
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { session } = useOutletContext();
  const permissions = session.permissions || getUserPermissions(session.user);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navItems = [
    ...(roleNavItems[session.user.role] || [])
      .filter((item) => !item.permission || permissions.includes(item.permission)),
    { label: "Logout", icon: CheckSquareIcon, onClick: handleLogout, bottom: true },
  ];

  return (
    <div className={styles.dashboardShell}>
      <Sidebar
        menuItems={navItems}
        title="Equine Elite"
        subtitle={`${session.user.role} Dashboard`}
        footerAction={null}
      />

      <div className={styles.contentShell}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.eyebrow}>{session.user.role} Dashboard</span>
            <h1>{session.user.stable || "Equine Elite Workspace"}</h1>
          </div>
          <div className={styles.permissionSummary}>
            {permissions.length} permissions active
          </div>
        </header>

        <main className={styles.mainContent}>
          <Outlet context={{ session, permissions }} />
        </main>
      </div>
    </div>
  );
}
