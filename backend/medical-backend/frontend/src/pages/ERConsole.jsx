import { useState, useEffect } from "react"
import { Activity, Thermometer, Droplets, Heart, UserPlus, Trash2 } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function ERConsole() {
    const [patients, setPatients] = useState([])
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, sRes] = await Promise.all([
                    api.get("/api/er/patients"),
                    api.get("/api/er/status")
                ])
                setPatients(pRes.data)
                setStatus(sRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [])

    const getTriageColor = (level) => {
        switch (level) {
            case 1: return "var(--critical)"
            case 2: return "var(--warning)"
            case 3: return "var(--accent)"
            default: return "var(--text-muted)"
        }
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-7xl mx-auto p-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        <Activity className="inline mr-2 text-accent" />
                        ER Live Command Console
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Real-time triage tracking and vital signs monitoring.
                    </p>
                </div>

                <div className="flex gap-4">
                    {status && (
                        <>
                            <div className="px-4 py-2 rounded-sm border bg-black/20 flex flex-col items-center" style={{ borderColor: "var(--border)" }}>
                                <span className="text-[10px] font-mono uppercase opacity-40">Waiting</span>
                                <span className="text-lg font-bold font-mono" style={{ color: "var(--warning)" }}>{status.waiting_count}</span>
                            </div>
                            <div className="px-4 py-2 rounded-sm border bg-black/20 flex flex-col items-center" style={{ borderColor: "var(--border)" }}>
                                <span className="text-[10px] font-mono uppercase opacity-40">Triage 1</span>
                                <span className="text-lg font-bold font-mono" style={{ color: "var(--critical)" }}>{status.critical_count}</span>
                            </div>
                        </>
                    )}
                    <button className="bg-accent text-black px-4 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2">
                        <UserPlus size={14} /> Intake
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-2 rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Live Triage Queue</span>
                        <div className="flex gap-2 text-[10px] font-mono opacity-40">
                            <span>SORTED BY SEVERITY</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Syncing with ER telemetry...</div>
                        ) : (
                            patients.map(p => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    key={p.id}
                                    className="p-4 border-b flex items-center gap-6 hover:bg-white/5 transition-colors"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <div className="w-1 border-r-4 h-12" style={{ borderRightColor: getTriageColor(p.triage_level) }} />

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold">{p.name}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase border"
                                                style={{ borderColor: getTriageColor(p.triage_level), color: getTriageColor(p.triage_level) }}>
                                                Triage {p.triage_level}
                                            </span>
                                        </div>
                                        <div className="text-[10px] opacity-40 font-mono italic">{p.complaint}</div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <Heart size={12} className="text-critical mb-1" />
                                            <span className="text-xs font-mono">112</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Thermometer size={12} className="text-warning mb-1" />
                                            <span className="text-xs font-mono">38.4</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Droplets size={12} className="text-accent mb-1" />
                                            <span className="text-xs font-mono">96</span>
                                        </div>
                                    </div>

                                    <div className="w-32 text-right">
                                        <span className="text-xs font-mono opacity-80 block">{p.wait_time}m wait</span>
                                        <span className="text-[10px] opacity-40 uppercase tracking-widest">DR. {p.assigned_doctor || 'PENDING'}</span>
                                    </div>

                                    <button className="p-2 opacity-20 hover:opacity-100 hover:text-critical transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-5 rounded-md border flex flex-col" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                        <h3 className="text-xs font-mono uppercase tracking-widest mb-4 opacity-60">Resource Load</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-mono mb-1">
                                    <span>Trauma Bay 1</span>
                                    <span className="text-critical">ACTIVE</span>
                                </div>
                                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-critical w-[85%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-mono mb-1">
                                    <span>Fast Track</span>
                                    <span className="text-success">CLEAR</span>
                                </div>
                                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-success w-[20%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-mono mb-1">
                                    <span>Ambulance Bay</span>
                                    <span className="text-warning">2 QUEUED</span>
                                </div>
                                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-warning w-[60%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-md border" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-active)", boxShadow: "0 0 20px rgba(77, 200, 200, 0.05)" }}>
                        <h3 className="text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            Gemini Prediction
                        </h3>
                        <p className="text-xs leading-relaxed opacity-80 mb-4">
                            Expected triage volume to surge by <span className="text-warning">+12%</span> in the next 2 hours based on regional trauma patterns. Recommend opening Overflow Ward 4.
                        </p>
                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                            Review Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
