import { NavLink, Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { getUserPermissions, logout } from "../services/auth";
import styles from "./DashboardLayout.module.css";

const roleNavItems = {
  Owner: [
    { label: "Overview", to: "/owner-dashboard" },
    { label: "Stable", to: "/owner-dashboard", permission: "horses:manage" },
    { label: "Finance", to: "/owner-dashboard", permission: "finance:view" },
  ],
  Jockey: [
    { label: "Overview", to: "/jockey-dashboard" },
    { label: "Ride Schedule", to: "/jockey-dashboard", permission: "schedule:manage" },
    { label: "Performance", to: "/jockey-dashboard", permission: "performance:view" },
  ],
  Spectator: [
    { label: "Overview", to: "/spectator-dashboard" },
    { label: "Live Races", to: "/spectator-dashboard", permission: "races:view" },
    { label: "Predictions", to: "/spectator-dashboard", permission: "predictions:view" },
  ],
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { session } = useOutletContext();
  const permissions = getUserPermissions(session.user);
  const navItems = roleNavItems[session.user.role] || [];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.dashboardShell}>
      <aside className={styles.sidebar}>
        <button className={styles.brandButton} type="button" onClick={() => navigate("/")}>
          <span className={styles.brandMark}></span>
          Equine Elite
        </button>

        <div className={styles.userCard}>
          <div className={styles.avatar}>{session.user.avatar || session.user.name?.slice(0, 2)}</div>
          <div>
            <strong>{session.user.name}</strong>
            <span>{session.user.role}</span>
          </div>
        </div>

        <nav className={styles.navList} aria-label={`${session.user.role} dashboard navigation`}>
          {navItems
            .filter((item) => !item.permission || permissions.includes(item.permission))
            .map((item) => (
              <NavLink className={styles.navLink} key={item.label} to={item.to} end>
                {item.label}
              </NavLink>
            ))}
        </nav>

        <button className={styles.logoutButton} type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

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
