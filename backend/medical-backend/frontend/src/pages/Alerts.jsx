import { useState, useEffect } from "react"
import { Bell, ShieldAlert, AlertTriangle, CheckCircle2, History } from "lucide-react"
import api from "../lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function Alerts() {
    const [alerts, setAlerts] = useState([])
    const [summary, setSummary] = useState({ critical: 0, warning: 0 })

    useEffect(() => {
        const fetch = async () => {
            try {
                const [aRes, sRes] = await Promise.all([
                    api.get("/api/alerts/active"),
                    api.get("/api/alerts/summary")
                ])
                setAlerts(aRes.data)
                setSummary(sRes.data)
            } catch (e) { console.error(e) }
        }
        fetch()
        const int = setInterval(fetch, 5000)
        return () => clearInterval(int)
    }, [])

    const resolve = async (id) => {
        try {
            await api.put(`/api/alerts/${id}/resolve`)
            setAlerts(prev => prev.filter(a => a.id !== id))
            setSummary(prev => {
                const a = alerts.find(x => x.id === id)
                if (a && a.severity === 'critical') return { ...prev, critical: prev.critical - 1 }
                if (a && a.severity === 'warning') return { ...prev, warning: prev.warning - 1 }
                return prev
            })
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-5xl mx-auto p-4 flex flex-col h-full">
            <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    <Bell className="inline mr-2 text-accent" />
                    Alert Center
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Manage global hospital notifications and automated AI warnings.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { l: "Critical", v: summary.critical, c: "var(--critical)" },
                    { l: "Warnings", v: summary.warning, c: "var(--warning)" },
                    { l: "Active", v: alerts.length, c: "var(--accent)" },
                    { l: "System", v: "Online", c: "var(--success)" }
                ].map((x, i) => (
                    <div key={i} className="rounded-md p-4 text-center" style={{ background: "var(--bg-surface)", border: `1px solid ${x.c}40` }}>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-secondary mb-1">{x.l}</div>
                        <div className="text-2xl font-serif font-bold font-mono" style={{ color: x.c }}>{x.v}</div>
                    </div>
                ))}
            </div>

            <div className="flex-1 rounded-md overflow-hidden flex flex-col" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                    <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Active Queue</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                        Sort: <span className="text-accent">Severity</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                        {alerts.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full opacity-50 space-y-3">
                                <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
                                <div className="text-sm font-mono tracking-widest uppercase">All Clear</div>
                            </motion.div>
                        ) : alerts.map((alert) => {
                            const isCrit = alert.severity === "critical"
                            const isWarn = alert.severity === "warning"
                            const cfg = {
                                bg: isCrit ? "rgba(239, 68, 68, 0.05)" : isWarn ? "rgba(245, 158, 11, 0.05)" : "var(--bg-elevated)",
                                color: isCrit ? "var(--critical)" : isWarn ? "var(--warning)" : "var(--text-primary)",
                                icon: isCrit ? ShieldAlert : isWarn ? AlertTriangle : Bell,
                                label: isCrit ? "CRITICAL" : isWarn ? "WARNING" : "INFO"
                            }
                            const Icon = cfg.icon

                            return (
                                <motion.div key={alert.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="rounded-md p-4 flex items-start gap-4" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>

                                    <div className="p-2 rounded-sm" style={{ background: `${cfg.color}15` }}>
                                        <Icon size={20} style={{ color: cfg.color }} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-mono font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                                            <div className="flex items-center gap-1 text-[10px] font-mono text-muted">
                                                <History size={10} />
                                                {new Date(alert.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>{alert.alert_type}</h4>
                                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{alert.message}</p>
                                    </div>

                                    <button onClick={() => resolve(alert.id)} className="h-full px-4 py-8 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest transition-all rounded-sm opacity-50 hover:opacity-100 hover:bg-black/20" style={{ color: cfg.color }}>
                                        Resolve
                                    </button>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
