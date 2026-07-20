import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/common/components/Sidebar";
import { MobileNav } from "@/common/components/MobileNav";
import { TopNavBar } from "@/common/components/TopNavBar";
import { DashboardFooter } from "@/common/components/DashboardFooter";
function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    // Fixed-height shell: the top bar + sidebar stay put; only the content area scrolls.
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <TopNavBar onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children ?? <Outlet />}
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
export {
  DashboardLayout
};
