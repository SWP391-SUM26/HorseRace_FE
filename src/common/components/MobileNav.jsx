import { X } from "lucide-react";
import { SidebarContent } from "./Sidebar";
function MobileNav({ open, onClose }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6">
        <button
    type="button"
    onClick={onClose}
    aria-label="Close menu"
    className="absolute right-4 top-4 text-muted hover:text-ink"
  >
          <X size={20} />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>;
}
export {
  MobileNav
};
