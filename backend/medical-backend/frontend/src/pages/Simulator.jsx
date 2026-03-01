import { useState } from "react"
import { Activity, Play, Settings2, RefreshCw, GitBranch } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Simulator() {
    const [params, setParams] = useState({
        doctors_added: 0,
        nurses_added: 0,
        divert_ambulances: false,
        add_icu_beds: 0
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const simulate = async () => {
        setLoading(true)
        try {
            const prompt = `WHAT IF SIMULATION: If we add ${params.doctors_added} doctors, ${params.nurses_added} nurses, ${params.divert_ambulances ? 'divert ambulances' : 'do not divert ambulances'}, and add ${params.add_icu_beds} ICU beds. What is the impact on the Health Score and ER Wait Time? Respond concisely in 3 bullet points.`

            const res = await api.post("/api/chatbot/message", { message: prompt, conversation_history: [] })
            setResult(res.data.response)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-6xl mx-auto p-4 flex flex-col h-full">
            <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    <GitBranch className="inline mr-2 text-accent" />
                    What-If Simulator
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Test operational decisions through Gemini to forecast impacts before executing them.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1">
                <div className="md:col-span-2 rounded-md p-6 flex flex-col" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Settings2 size={16} style={{ color: "var(--accent)" }} />
                        Operational Levers
                    </h3>

                    <div className="space-y-5 flex-1">
                        <div>
                            <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 text-secondary">Add Doctors to Shift</label>
                            <input type="range" min="0" max="10" value={params.doctors_added} onChange={e => setParams({ ...params, doctors_added: e.target.value })} className="w-full" />
                            <div className="text-right text-xs font-mono">+{params.doctors_added}</div>
                        </div>
                        <div>
                            <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 text-secondary">Add Nurses to Shift</label>
                            <input type="range" min="0" max="20" value={params.nurses_added} onChange={e => setParams({ ...params, nurses_added: e.target.value })} className="w-full" />
                            <div className="text-right text-xs font-mono">+{params.nurses_added}</div>
                        </div>
                        <div>
                            <label className="text-xs font-mono uppercase tracking-widest text-muted block mb-2 text-secondary">Add Temporary ICU Beds</label>
                            <input type="range" min="0" max="50" step="5" value={params.add_icu_beds} onChange={e => setParams({ ...params, add_icu_beds: e.target.value })} className="w-full" />
                            <div className="text-right text-xs font-mono">+{params.add_icu_beds}</div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <label className="text-xs font-mono uppercase tracking-widest text-muted text-secondary">Divert Ambulances (2hr)</label>
                            <input type="checkbox" checked={params.divert_ambulances} onChange={e => setParams({ ...params, divert_ambulances: e.target.checked })} className="w-5 h-5 accent-accent" />
                        </div>
                    </div>

                    <button onClick={simulate} disabled={loading} className="w-full mt-6 py-3 rounded-md font-mono text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--bg-elevated)", color: "var(--accent)", border: "1px solid var(--border-active)" }}>
                        {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                        {loading ? "Simulating..." : "Run Simulation"}
                    </button>
                </div>

                <div className="md:col-span-3 rounded-md p-6 relative overflow-hidden flex flex-col" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Activity size={16} style={{ color: "var(--accent)" }} />
                        AI Simulation Results
                    </h3>

                    <div className="flex-1 flex flex-col justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center opacity-70">
                                <div className="w-16 h-16 rounded-full border-4 border-t-accent animate-spin mb-4" style={{ borderColor: 'var(--border) var(--border) var(--border) var(--accent)' }} />
                                <div className="text-xs font-mono">Gemini is recalculating metrics...</div>
                            </div>
                        ) : result ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                                {result}
                            </motion.div>
                        ) : (
                            <div className="text-center opacity-40">
                                <Activity size={48} className="mx-auto mb-3" />
                                <p className="text-xs font-mono">Adjust the levers on the left and click "Run Simulation" to generate AI forecasts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
