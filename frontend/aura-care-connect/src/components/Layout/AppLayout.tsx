import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import FloatingChatbot from "@/components/FloatingChatbot";
import { Bell, Search } from "lucide-react";
import { useActiveAlerts } from "@/hooks/useQueries";

export default function AppLayout() {
  const { data: alertsData } = useActiveAlerts();
  
  const alerts = alertsData || [];
  const criticalCount = alerts.filter((a: any) => a.alert_type === "critical").length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <AppSidebar />
      {/* Main content area - offset for sidebar */}
      <div className="ml-[240px] min-h-screen transition-all duration-200">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 border-b border-[#e5e7eb] bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search hospital records..."
                className="w-full h-9 pl-9 pr-4 rounded-sm bg-[#f3f4f6] border border-[#e5e7eb] text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#e35d3d]/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-md hover:bg-[#f3f4f6] transition-colors cursor-pointer border border-transparent hover:border-[#e5e7eb]">
              <Bell className="w-4 h-4 text-[#6b7280]" />
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#f03a3a] text-white text-[9px] font-bold flex items-center justify-center">
                  {criticalCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-sm bg-[#e35d3d] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase">ADM</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <FloatingChatbot />
    </div>
  );
}
