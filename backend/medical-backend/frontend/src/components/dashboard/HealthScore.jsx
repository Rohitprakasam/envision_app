import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react"
import api from "../../lib/api"

export default function HealthScore() {
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchScore = () => {
            api.get("/api/analytics/health-score").then(res => setData(res.data)).catch(console.error)
        }
        fetchScore()
        const int = setInterval(fetchScore, 10000)
        return () => clearInterval(int)
    }, [])

    if (!data) return (
        <div className="rounded-md p-8 flex items-center justify-center h-64 animate-pulse"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }} />
    )

    const color = data.status === "stable" ? "var(--success)" :
        data.status === "warning" ? "var(--warning)" : "var(--critical)"
    const Icon = data.status === "stable" ? ShieldCheck :
        data.status === "warning" ? ShieldAlert : ShieldX

    return (
        <div className="rounded-md p-6 relative overflow-hidden h-full flex flex-col justify-center"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20"
                style={{ background: color }} />

            <h3 className="text-sm font-medium mb-6 flex items-center gap-2 relative z-10" style={{ color: "var(--text-secondary)" }}>
                <Icon size={16} style={{ color }} />
                Hospital Health Score
            </h3>

            <div className="flex flex-col items-center justify-center relative z-10">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" style={{ stroke: "var(--bg-elevated)" }} />
                        <motion.circle
                            cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
                            style={{ stroke: color }}
                            initial={{ strokeDasharray: "0 300" }}
                            animate={{ strokeDasharray: `${(data.score / 100) * 283} 300` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="flex flex-col items-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-4xl font-serif font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                            {data.score}
                        </motion.span>
                        <span className="text-xs font-mono uppercase tracking-widest mt-1" style={{ color }}>{data.status}</span>
                    </div>
                </div>

                <div className="mt-6 w-full space-y-3">
                    {Object.entries(data.breakdown || {}).map(([key, val]) => {
                        const score = typeof val === 'object' && val !== null ? val.score : val;
                        return (
                            <div key={key}>
                                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1"
                                    style={{ color: "var(--text-secondary)" }}>
                                    <span>{key} Sub-score</span>
                                    <span>{score || 0}/100</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${score || 0}%` }} transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full" style={{ background: (score || 0) < 60 ? "var(--critical)" : (score || 0) < 80 ? "var(--warning)" : "var(--success)" }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
