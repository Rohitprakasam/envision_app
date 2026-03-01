import { useState, useEffect } from "react"
import { BrainCog, Clock, BedDouble, Activity, ShieldAlert } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Predictions() {
    const [erPred, setEr] = useState(null)
    const [bedPred, setBed] = useState(null)

    useEffect(() => {
        api.get("/api/predictions/er-wait").then(r => setEr({
            predicted_wait_time_minutes: r.data[3] ? r.data[3].predicted_wait : 0
        })).catch(console.error)
        api.get("/api/predictions/bed-shortage").then(r => setBed({
            shortage_probability: r.data[0] ? r.data[0].shortage_probability_4h : 0,
            estimated_time_to_capacity: "4 hours"
        })).catch(console.error)
    }, [])

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-6xl mx-auto p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        <BrainCog className="inline mr-2 text-accent" />
                        Predictive Intelligence
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        AI models forecasting hospital operations.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ER Predictor */}
                <div className="rounded-md p-6 relative overflow-hidden h-64" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <div className="absolute top-0 right-0 p-3"><BrainCog size={80} className="opacity-5" style={{ color: "var(--accent)" }} /></div>
                    <h3 className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Clock size={16} style={{ color: "var(--accent)" }} />
                        ER Wait Forecast (4hr)
                    </h3>
                    {erPred ? (
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-5xl font-serif font-bold font-mono mb-2" style={{ color: erPred.predicted_wait_time_minutes > 120 ? "var(--critical)" : "var(--warning)" }}>
                                {Math.round(erPred.predicted_wait_time_minutes)}<span className="text-xl">m</span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                Predicted wait time in 4 hours based on current volume and active doctors.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-pulse h-20 rounded-md bg-white/5 w-1/2" />
                    )}
                </div>

                {/* Bed Predictor */}
                <div className="rounded-md p-6 relative overflow-hidden h-64" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <div className="absolute top-0 right-0 p-3"><BedDouble size={80} className="opacity-5" style={{ color: "var(--accent)" }} /></div>
                    <h3 className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <ShieldAlert size={16} style={{ color: "var(--accent)" }} />
                        Ward Shortage Risk
                    </h3>
                    {bedPred ? (
                        <div className="flex flex-col h-full justify-center">
                            <div className="text-5xl font-serif font-bold font-mono mb-2" style={{ color: bedPred.shortage_probability > 0.8 ? "var(--critical)" : "var(--accent)" }}>
                                {(bedPred.shortage_probability * 100).toFixed(0)}<span className="text-xl">%</span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                Probability of ICU running out of beds within: <strong style={{ color: "var(--text-primary)" }}>{bedPred.estimated_time_to_capacity}</strong>.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-pulse h-20 rounded-md bg-white/5 w-1/2" />
                    )}
                </div>

                {/* Placeholder for Patient-Level ML */}
                <div className="md:col-span-2 rounded-md p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Activity size={16} style={{ color: "var(--accent)" }} />
                        Patient-Level Predictions (Sample)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {["Fall Risk", "30-Day Readmission", "Sepsis Risk", "Discharge Readiness"].map((label, i) => (
                            <div key={i} className="p-4 rounded-md text-center border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                                <div className="text-[10px] font-mono text-muted uppercase tracking-widest">{label}</div>
                                <div className="text-xl font-mono mt-2" style={{ color: i === 0 ? "var(--critical)" : "var(--text-primary)" }}>{[84, 12, 5, 95][i]}%</div>
                                <div className="text-[10px] mt-1 text-muted">Model ID: XGB-{100 + i}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
