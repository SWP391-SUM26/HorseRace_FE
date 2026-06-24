import { NavLink, Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@/common/hooks/useAuth";
import { Avatar } from "@/common/ui/Avatar";
import { Button } from "@/common/ui/Button";
import { ROLE_LABELS, ROLE_HOME } from "@/common/config/roles";
import { ROLE_NAV } from "@/common/config/nav";
import { cn } from "@/common/lib/cn";
function TopNavBar() {
  const { user } = useAuth();
  if (!user) return null;
  const roleKey = user.apiRole || user.role?.toUpperCase();
  const nav = ROLE_NAV[roleKey];
  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-6">
      <div className="flex items-center gap-8">
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
        <button aria-label="Notifications" className="text-muted hover:text-ink">
          <Bell size={20} />
        </button>
        <button aria-label="Settings" className="text-muted hover:text-ink">
          <Settings size={20} />
        </button>
        {nav?.primaryAction && <Link to={nav.primaryAction.to}>
            <Button size="sm">{nav.primaryAction.label}</Button>
          </Link>}
        <div className="flex items-center gap-3">
          <Avatar name={user.name || "User"} src={user.avatarUrl || user.avatar} />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-ink">{user.name || "User"}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[roleKey]}</p>
          </div>
        </div>
      </div>
    </header>;
}
export {
  TopNavBar
};
