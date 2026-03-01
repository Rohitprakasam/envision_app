import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react"
import api from "../../lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function AlertFeed({ limit = 10 }) {
    const [alerts, setAlerts] = useState([])

    useEffect(() => {
        const fetch = () => api.get("/api/alerts/active").then(r => setAlerts(r.data.slice(0, limit))).catch(console.error)
        fetch()
        const int = setInterval(fetch, 5000)
        return () => clearInterval(int)
    }, [limit])

    const resolve = async (id) => {
        try {
            await api.put(`/api/alerts/${id}/resolve`)
            setAlerts(prev => prev.filter(a => a.id !== id))
        } catch (e) {
            console.error(e)
        }
    }

    if (!alerts.length) return (
        <div className="rounded-md p-5 flex flex-col h-full"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Bell size={16} style={{ color: "var(--accent)" }} />
                Live Alert Feed
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-10">
                <CheckCircle2 size={32} className="mb-2" style={{ color: "var(--success)" }} />
                <p className="text-xs font-mono">No active alerts. Systems normal.</p>
            </div>
        </div>
    )

    return (
        <div className="rounded-md p-5 flex flex-col h-full"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Bell size={16} style={{ color: "var(--accent)" }} />
                    Live Alert Feed
                </h3>
                <span className="text-[10px] font-mono px-2 py-1 rounded-sm"
                    style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--critical)" }}>
                    {alerts.filter(a => a.severity === "critical").length} CRITICAL
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <AnimatePresence>
                    {alerts.map(alert => {
                        const isCrit = alert.severity === "critical"
                        const isWarn = alert.severity === "warning"
                        const color = isCrit ? "var(--critical)" : isWarn ? "var(--warning)" : "var(--accent)"
                        const Icon = isCrit ? ShieldAlert : isWarn ? AlertTriangle : Info

                        return (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="p-3 rounded-md flex gap-3 relative overflow-hidden group border"
                                style={{ background: "var(--bg-elevated)", borderColor: isCrit ? "rgba(239, 68, 68, 0.3)" : "var(--border)" }}
                            >
                                {/* Left indicator line */}
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: color }} />

                                <div className="mt-0.5">
                                    <Icon size={14} style={{ color }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>
                                            {alert.alert_type}
                                        </span>
                                        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                        {alert.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => resolve(alert.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-2 rounded-sm text-[10px] font-mono hover:bg-black/20"
                                    style={{ color: "var(--text-secondary)" }}>
                                    RESOLVE
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}
