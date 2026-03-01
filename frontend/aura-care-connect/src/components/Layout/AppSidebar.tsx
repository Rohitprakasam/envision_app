import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  Bed,
  Pill,
  FlaskConical,
  Users,
  BrainCircuit,
  FlaskRound,
  Eye,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Command Center", icon: LayoutDashboard },
  { path: "/emr", label: "EMR Directory", icon: Bed },
  { path: "/er-console", label: "ER Console", icon: Activity },
  { path: "/pharmacy", label: "Pharmacy", icon: Pill },
  { path: "/labs", label: "Lab Results", icon: FlaskConical },
  { path: "/staff", label: "Staff & OT", icon: Users },
  { path: "/predictions", label: "Predictions", icon: BrainCircuit },
  { path: "/simulator", label: "Simulator", icon: FlaskRound },
  { path: "/cv-monitor", label: "CV Monitor", icon: Eye },
  { path: "/copilot", label: "AI Copilot", icon: MessageSquare },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-[#e5e7eb] flex flex-col z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#e5e7eb] flex-shrink-0">
        <div className="w-8 h-8 rounded-sm bg-[#e35d3d] flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden"
          >
            <h1 className="text-sm font-bold tracking-[0.2em] text-[#1a1a1a] uppercase">AURA-H</h1>
            <p className="text-[9px] text-[#6b7280] uppercase tracking-widest mt-0.5">Hospital Systems</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-[#e35d3d]/5 text-[#e35d3d]"
                  : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a1a]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#e35d3d]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#e35d3d]" : ""}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-[#e5e7eb] text-[#9ca3af] hover:text-[#1a1a1a] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
