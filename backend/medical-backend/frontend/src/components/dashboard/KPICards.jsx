import { useState, useEffect } from "react"
import { Activity, Clock, Bed, AlertTriangle } from "lucide-react"
import api from "../../lib/api"
import { motion } from "framer-motion"

const ICONS = {
    Users: Activity,
    Clock: Clock,
    BedDouble: Bed,
    AlertTriangle: AlertTriangle
}

export default function KPICards() {
    const [kpis, setKpis] = useState([])

    useEffect(() => {
        const fetch = () => api.get("/api/analytics/kpis").then(r => {
            const d = r.data;
            setKpis([
                { title: "Active Patients", value: d.active_patients, status: "normal", icon: "Users", change: "+12" },
                { title: "ER Wait Time", value: `${d.er_status.avg_wait_minutes}m`, status: d.er_status.avg_wait_minutes > 120 ? "critical" : d.er_status.avg_wait_minutes > 60 ? "warning" : "normal", icon: "Clock", change: "-5m" },
                { title: "Available Beds", value: d.bed_occupancy.total - d.bed_occupancy.occupied, status: d.bed_occupancy.percentage > 90 ? "critical" : d.bed_occupancy.percentage > 75 ? "warning" : "normal", icon: "BedDouble", change: "-2" },
                { title: "Critical Alerts", value: d.alerts.critical, status: d.alerts.critical > 0 ? "critical" : "normal", icon: "AlertTriangle", change: "+1" }
            ])
        }).catch(console.error)
        fetch()
        const int = setInterval(fetch, 10000)
        return () => clearInterval(int)
    }, [])

    if (!kpis.length) return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 rounded-md animate-pulse"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }} />
            ))}
        </div>
    )

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {kpis.map((kpi, i) => {
                const Icon = ICONS[kpi.icon] || Activity
                const color = kpi.status === "critical" ? "var(--critical)" :
                    kpi.status === "warning" ? "var(--warning)" : "var(--accent)"
                const bg = kpi.status === "critical" ? "rgba(239, 68, 68, 0.05)" :
                    kpi.status === "warning" ? "rgba(245, 158, 11, 0.05)" : "var(--bg-surface)"

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i}
                        className="rounded-md p-4 relative overflow-hidden cursor-default group"
                        style={{ background: bg, border: `1px solid ${kpi.status !== 'normal' ? color + '40' : 'var(--border)'}` }}>

                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className="text-xs font-mono font-medium tracking-wide" style={{ color: "var(--text-secondary)" }}>
                                {kpi.title}
                            </span>
                            <div className="p-1.5 rounded-md" style={{ background: "var(--bg-elevated)" }}>
                                <Icon size={14} style={{ color }} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="text-3xl font-serif font-bold font-mono mb-1" style={{ color: "var(--text-primary)" }}>
                                {kpi.value}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                                    style={{ background: "var(--bg-elevated)", color: color }}>
                                    {kpi.change}
                                </span>
                                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs last hour</span>
                            </div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                            style={{ background: color }} />
                    </motion.div>
                )
            })}
        </div>
    )
}
