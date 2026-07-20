import { useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { Rabbit, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/common/hooks/useAuth";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { Avatar } from "@/common/ui/Avatar";
import { ROLE_NAV } from "@/common/config/nav";
import { ROLE_LABELS } from "@/common/config/roles";
import { cn } from "@/common/lib/cn";
const SPECTATOR_HOME = "/app/spectator";
function Brand({ onClick }) {
  return <Link to={SPECTATOR_HOME} onClick={onClick} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
        <Rabbit size={18} />
      </span>
      <span className="text-lg font-bold text-ink">Equine Elite</span>
    </Link>;
}
const linkClass = ({ isActive }) => cn(
  "border-b-2 py-5 text-sm transition-colors",
  isActive ? "border-brand-700 text-ink" : "border-transparent text-muted hover:text-ink"
);
function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return <div className="relative">
      <button
    type="button"
    aria-label="Account menu"
    onClick={() => setOpen((o) => !o)}
    className="flex items-center gap-2"
  >
        <Avatar name={user.fullName} src={user.avatarUrl} />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-ink">{user.fullName}</span>
          <span className="block text-xs text-muted">{ROLE_LABELS[user.role]}</span>
        </span>
      </button>

      {open && <>
          <button
    type="button"
    aria-label="Close menu"
    className="fixed inset-0 z-40 cursor-default"
    onClick={() => setOpen(false)}
  />
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-medium text-ink">{user.fullName}</p>
              <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
    type="button"
    onClick={() => {
      setOpen(false);
      logout();
    }}
    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
  >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </>}
    </div>;
}
function SpectatorLayout({ children }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return null;
  const links = ROLE_NAV.SPECTATOR.topbar;
  return <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 w-full border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Brand />
            <nav className="hidden items-center gap-6 md:flex">
              {links.map(({ label, to }) => <NavLink key={to} to={to} end className={linkClass}>
                  {label}
                </NavLink>)}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <ProfileMenu />
            <button
    type="button"
    onClick={() => setMobileOpen((o) => !o)}
    aria-label="Toggle navigation"
    className="text-muted hover:text-ink md:hidden"
  >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {
    /* Mobile menu — collapses the center links below the bar. */
  }
        {mobileOpen && <nav className="flex flex-col border-t border-border px-4 py-2 md:hidden">
            {links.map(({ label, to }) => <NavLink
    key={to}
    to={to}
    end
    onClick={() => setMobileOpen(false)}
    className={({ isActive }) => cn(
      "rounded-lg px-3 py-2 text-sm transition-colors",
      isActive ? "bg-subtle font-medium text-brand-700" : "text-muted hover:bg-subtle hover:text-ink"
    )}
  >
                {label}
              </NavLink>)}
          </nav>}
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children ?? <Outlet />}
      </main>
    </div>;
}
export {
  SpectatorLayout
};
