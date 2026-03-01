import { useState, useEffect } from "react"
import { FlaskConical, Microscope, Clock, AlertCircle, FileText, ChevronRight } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Labs() {
    const [pending, setPending] = useState([])
    const [critical, setCritical] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, cRes] = await Promise.all([
                    api.get("/api/labs/pending"),
                    api.get("/api/labs/critical")
                ])
                setPending(pRes.data)
                setCritical(cRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-7xl mx-auto p-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        <FlaskConical className="inline mr-2 text-accent" />
                        Laboratory Information System (LIS)
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Real-time pathology tracking and critical value management.
                    </p>
                </div>

                <div className="px-6 py-2 rounded-sm border bg-black/20" style={{ borderColor: "var(--border)" }}>
                    <div className="text-[10px] font-mono uppercase opacity-40">Avg Turnaround</div>
                    <div className="text-lg font-bold font-mono">42 <span className="text-[10px] opacity-40 uppercase">min</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                <div className="rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <AlertCircle size={14} style={{ color: "var(--critical)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Critical Results (Immediate Action)</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Scanning lab databases for critical flags...</div>
                        ) : critical.length === 0 ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 font-mono">No critical lab values reported.</div>
                        ) : (
                            critical.map(test => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                    key={test.id}
                                    className="p-4 border-b last:border-0 border-critical/10 bg-critical/5 hover:bg-critical/10 transition-colors"
                                    style={{ borderColor: "rgba(239, 68, 68, 0.1)" }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-xs font-bold text-critical uppercase">{test.test_type}</div>
                                            <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">PATIENT_ID_{test.patient_id}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-critical">{test.result_value}</div>
                                            <div className="text-[9px] font-mono text-critical/60 uppercase">Reference: {test.reference_range}</div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-2 py-1.5 rounded-sm bg-critical text-white font-mono text-[10px] uppercase tracking-widest hover:opacity-90">
                                        Notify Physician
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <Microscope size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Pending Diagnostics</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Syncing diagnostic queue...</div>
                        ) : (
                            pending.map(test => (
                                <div key={test.id} className="p-4 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold">{test.test_type}</span>
                                        <div className="flex items-center gap-2">
                                            <Clock size={10} className="opacity-40" />
                                            <span className="text-[10px] font-mono opacity-60">
                                                {new Date(test.ordered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] font-mono uppercase opacity-40 tracking-tighter">
                                            PATIENT ID: 00{test.patient_id} | STATUS: {test.status}
                                        </div>
                                        <ChevronRight size={14} className="opacity-20" />
                                    </div>
                                    <div className="mt-2 h-0.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent w-[35%] animate-pulse" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-md border flex items-center gap-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <FileText size={20} className="text-accent opacity-60" />
                    <div>
                        <div className="text-[10px] font-mono uppercase opacity-40">Imaging Pending</div>
                        <div className="text-lg font-bold font-mono">12 <span className="text-[10px] text-warning uppercase">CT / MRI</span></div>
                    </div>
                </div>
                <div className="md:col-span-2 p-4 rounded-md border flex items-center justify-between" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3">
                        <Microscope size={20} className="text-accent" />
                        <div className="text-[10px] font-mono uppercase opacity-60 leading-tight">
                            Pathology department operating at 85% capacity. <br /> Estimated TAT for Routine orders: <span className="text-accent underline">2.4 hours</span>.
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                        Department Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
