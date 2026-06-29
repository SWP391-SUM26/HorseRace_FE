import { Outlet } from "react-router-dom";
import { Sidebar } from "@/common/components/Sidebar";
import { TopNavBar } from "@/common/components/TopNavBar";
import { DashboardFooter } from "@/common/components/DashboardFooter";
function DashboardLayout() {
  return <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg">
      <TopNavBar />
      <div className="flex min-w-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <main className="min-w-0 flex-1 overflow-x-hidden p-6 lg:p-8">
            <Outlet />
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>;
}
export {
  DashboardLayout
};
