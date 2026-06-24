import { NavLink, Link } from "react-router-dom";
import { HelpCircle, LogOut, PlusCircle } from "lucide-react";
import { ROLE_NAV, roleWord } from "@/common/config/nav";
import { ROLE_HOME } from "@/common/config/roles";
import { useAuth } from "@/common/hooks/useAuth";
import { cn } from "@/common/lib/cn";

const itemBase = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
const itemInactive = "text-muted hover:bg-subtle hover:text-ink";

function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleKey = user.apiRole || user.role?.toUpperCase();
  const nav = ROLE_NAV[roleKey];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
      <Link to={ROLE_HOME[roleKey] || "/"} className="px-3 pb-6">
        <span className="block font-semibold text-ink">Equine Elite</span>
        <span className="block text-xs text-muted">Elite {roleWord(roleKey)} Portal</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav?.sidebar?.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => cn(itemBase, isActive ? "bg-subtle font-medium text-brand-700" : itemInactive)}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-brand-700" : undefined} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-6">
        {nav?.primaryAction && (
          <Link to={nav.primaryAction.to} className={cn(itemBase, itemInactive)}>
            <PlusCircle size={18} />
            {nav.primaryAction.label}
          </Link>
        )}
        <a href="#" className={cn(itemBase, itemInactive)}>
          <HelpCircle size={18} />
          Support
        </a>
        <button type="button" onClick={logout} className={cn(itemBase, itemInactive, "text-left")}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export { Sidebar };
