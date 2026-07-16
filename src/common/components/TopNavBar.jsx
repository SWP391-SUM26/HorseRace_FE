import { NavLink, Link } from "react-router-dom";
import { Menu, Settings } from "lucide-react";
import { useAuth } from "@/common/hooks/useAuth";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { Avatar } from "@/common/ui/Avatar";
import { Button } from "@/common/ui/Button";
import { ROLE_LABELS, ROLE_HOME } from "@/common/config/roles";
import { ROLE_NAV } from "@/common/config/nav";
import { cn } from "@/common/lib/cn";

function TopNavBar({ onMenuClick }) {
  const { user } = useAuth();
  if (!user) return null;
  const roleKey = (user.apiRole || user.role || "").toUpperCase();
  const nav = ROLE_NAV[roleKey];
  return <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-4 sm:gap-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="text-muted hover:text-ink md:hidden"
        >
          <Menu size={22} />
        </button>
        <Link to={ROLE_HOME[roleKey] || "/"} className="font-semibold text-ink">
          Equine Elite
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav?.topbar?.map(({ label, to }) => <NavLink
    key={to}
    to={to}
    end
    className={({ isActive }) => cn(
      "border-b-2 py-5 text-sm transition-colors",
      isActive ? "border-brand-700 text-ink" : "border-transparent text-muted hover:text-ink"
    )}
  >
              {label}
            </NavLink>)}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link to="/profile" aria-label="Settings" className="text-muted hover:text-ink">
          <Settings size={20} />
        </Link>
        {nav?.primaryAction && <Link to={nav.primaryAction.to}>
            <Button size="sm">{nav.primaryAction.label}</Button>
          </Link>}
        <div className="flex items-center gap-3">
          <Avatar name={user.name || user.fullName || "User"} src={user.avatarUrl || user.avatar} />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-ink">{user.name || user.fullName || "User"}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[roleKey]}</p>
          </div>
        </div>
      </div>
    </header>;
}
export {
  TopNavBar
};

