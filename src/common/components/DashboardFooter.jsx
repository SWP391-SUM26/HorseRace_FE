import { Link } from "react-router-dom";
const FOOTER_LINKS = ["Terms of Service", "Privacy Policy", "Help Center"];
function DashboardFooter() {
  return <footer className="flex flex-col gap-3 border-t border-border bg-surface px-6 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="font-medium text-ink">Equine Elite Analytics</span>
        <span className="ml-2">© 2026 Equine Elite Analytics. All rights reserved.</span>
      </div>
      <nav className="flex flex-wrap items-center gap-4">
        {FOOTER_LINKS.map((label) => <Link key={label} to="#" className="text-muted hover:text-ink">
            {label}
          </Link>)}
      </nav>
    </footer>;
}
export {
  DashboardFooter
};
