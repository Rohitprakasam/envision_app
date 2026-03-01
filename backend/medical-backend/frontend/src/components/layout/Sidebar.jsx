import { LayoutDashboard, BrainCog, Activity, View, Bell, Users, Stethoscope, Pill, FlaskConical, Users2 } from "lucide-react"

const nav = [
    { path: "/dashboard", name: "Command Center", icon: <LayoutDashboard size={18} /> },
    { path: "/patients", name: "EMR / Patients", icon: <Users size={18} /> },
    { path: "/er-console", name: "ER Console", icon: <Stethoscope size={18} /> },
    { path: "/pharmacy", name: "Pharmacy", icon: <Pill size={18} /> },
    { path: "/labs", name: "Lab Results", icon: <FlaskConical size={18} /> },
    { path: "/staff", name: "Staff & OT", icon: <Users2 size={18} /> },
    { path: "/predictions", name: "Predictive Intelligence", icon: <BrainCog size={18} /> },
    { path: "/simulator", name: "What-If Simulator", icon: <Activity size={18} /> },
    { path: "/vision", name: "CV Monitor", icon: <View size={18} /> },
    { path: "/alerts", name: "Alert Center", icon: <Bell size={18} /> }
]

import { NavLink } from "react-router-dom"

export default function Sidebar() {
    return (
        <div className="w-64 h-full border-r flex flex-col relative z-20"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
            {/* Brand */}
            <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center relative overflow-hidden"
                        style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)" }}>
                        <Activity style={{ color: "var(--accent)", zIndex: 10 }} />
                    </div>
                    <div>
                        <div className="text-sm font-bold tracking-widest" style={{ color: "var(--accent)" }}>AOAI</div>
                        <div className="text-[10px] font-mono tracking-widest opacity-60">ADMINISTRATOR</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {nav.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-[13px] font-medium ${isActive ? "active-link shadow-lg shadow-black/20" : ""
                            }`
                        }
                        style={({ isActive }) => ({
                            background: isActive ? "var(--bg-elevated)" : "transparent",
                            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                            border: isActive ? "1px solid var(--border-active)" : "1px solid transparent",
                            borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                        })}
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </div>

            {/* Bottom Status */}
            <div className="p-6 border-t text-xs font-mono flex items-center gap-2"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                SYSTEM ACTIVE
            </div>
        </div>
    )
}
