import { useState, useEffect } from "react"
import { Pill, BarChart3, Clock, AlertTriangle, PenLine, Package } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Pharmacy() {
    const [inventory, setInventory] = useState([])
    const [prescriptions, setPrescriptions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [iRes, pRes] = await Promise.all([
                    api.get("/api/pharmacy/stock"),
                    api.get("/api/pharmacy/prescriptions")
                ])
                setInventory(iRes.data)
                setPrescriptions(pRes.data)
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
                        <Pill className="inline mr-2 text-accent" />
                        Pharmacy Inventory Control
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Automated stock level tracking and prescription verification.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="bg-elevated border border-border-active text-accent px-4 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                        <PenLine size={14} /> New Order
                    </button>
                    <button className="bg-accent text-black px-4 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2">
                        <Package size={14} /> Receive Stock
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                <div className="rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2">
                            <BarChart3 size={14} style={{ color: "var(--accent)" }} />
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Inventory Status</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-40">SORTED BY REPLENISHMENT PRIORITY</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Scanning pharmacy blockchain...</div>
                        ) : (
                            inventory.map(item => (
                                <div key={item.id} className="p-3 bg-black/10 border rounded-sm transition-all hover:border-accent/40" style={{ borderColor: "var(--border)" }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-sm font-bold">{item.drug_name}</div>
                                            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">{item.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold" style={{ color: item.stock_quantity < item.minimum_threshold ? "var(--critical)" : "var(--success)" }}>
                                                {item.stock_quantity} {item.unit}
                                            </div>
                                            <div className="text-[9px] opacity-40 font-mono">Min: {item.minimum_threshold}</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${Math.min(100, (item.stock_quantity / item.minimum_threshold) * 50)}%` }}
                                            className="h-full"
                                            style={{ background: item.stock_quantity < item.minimum_threshold ? "var(--critical)" : "var(--accent)" }}
                                        />
                                    </div>
                                    {item.stock_quantity < item.minimum_threshold && (
                                        <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-critical uppercase animate-pulse">
                                            <AlertTriangle size={10} /> STOCK CRITICALLY LOW - PO GENERATED
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <Clock size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Prescription Flow</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Syncing patient medication profiles...</div>
                        ) : (
                            prescriptions.map(p => (
                                <div key={p.id} className="p-4 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold leading-tight max-w-[70%]">{p.medication_name}</span>
                                        <span className="text-[10px] font-mono opacity-60">{p.dose}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] font-mono uppercase opacity-40 tracking-tighter">
                                            PATIENT ID: 00{p.patient_id} | {p.frequency}
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full border text-[8px] font-mono uppercase tracking-widest"
                                            style={{ borderColor: p.is_filled ? "var(--success)" : "var(--warning)", color: p.is_filled ? "var(--success)" : "var(--warning)" }}>
                                            {p.is_filled ? 'FILLED' : 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-md border bg-accent/5 border-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                        <AlertTriangle className="text-accent" size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Dangerous Drug Interaction Alert</div>
                        <div className="text-[10px] font-mono opacity-60">Gemini identified 1 potential contraindication in Ward B (Patient #1042). Review required.</div>
                    </div>
                </div>
                <button className="px-4 py-2 bg-accent text-black rounded-sm font-mono text-[10px] uppercase tracking-widest hover:opacity-90">Review Interaction</button>
            </div>
        </div>
    )
}
