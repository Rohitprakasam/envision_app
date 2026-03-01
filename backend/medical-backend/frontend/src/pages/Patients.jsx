import { useState, useEffect } from "react"
import { Users, Search, Filter, Mail, Phone, Calendar, ArrowRight } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Patients() {
    const [beds, setBeds] = useState([])
    const [search, setSearch] = useState("")
    const [filterWard, setFilterWard] = useState("All")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/api/beds/all")
            .then(res => setBeds(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    const filteredBeds = beds.filter(b => {
        const matchesSearch = b.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.bed_number.toLowerCase().includes(search.toLowerCase())
        const matchesWard = filterWard === "All" || b.ward === filterWard
        return matchesSearch && matchesWard
    })

    const wards = ["All", "ICU", "General", "Pediatrics", "Emergency", "Maternity", "Surgical"]

    return (
        <div className="space-y-6 animate-fade-in relative z-10 max-w-7xl mx-auto p-4 flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                        <Users className="inline mr-2 text-accent" />
                        EMR / Patient Directory
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Active bed management and electronic medical record navigation.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                        <input
                            type="text"
                            placeholder="Search patients or beds..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-sm text-xs font-mono outline-none border transition-all focus:border-accent"
                            style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                        <select
                            value={filterWard}
                            onChange={(e) => setFilterWard(e.target.value)}
                            className="pl-9 pr-8 py-2 rounded-sm text-xs font-mono outline-none border appearance-none transition-all focus:border-accent"
                            style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        >
                            {wards.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="rounded-md border overflow-hidden flex flex-col h-full" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="grid grid-cols-5 p-4 border-b font-mono text-[10px] uppercase tracking-widest bg-black/20" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                        <span>Patient & Bed</span>
                        <span>Ward / Floor</span>
                        <span>Admission Date</span>
                        <span>Discharge Forecast</span>
                        <span className="text-right">Action</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center opacity-40 animate-pulse font-mono text-xs">Accessing encrypted EMR database...</div>
                        ) : filteredBeds.length === 0 ? (
                            <div className="p-20 text-center opacity-40 font-mono text-xs">No matching patient records found.</div>
                        ) : (
                            filteredBeds.map(b => (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    key={b.id}
                                    className="grid grid-cols-5 p-4 items-center border-b transition-colors hover:bg-white/5"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-sm" style={{ color: b.status === 'occupied' ? "var(--text-primary)" : "var(--text-muted)" }}>
                                            {b.patient_name || '-- UNASSIGNED --'}
                                        </span>
                                        <span className="text-[10px] font-mono uppercase tracking-tighter" style={{ color: "var(--accent)" }}>
                                            BED {b.bed_number}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs">{b.ward}</span>
                                        <span className="text-[10px] opacity-40 font-mono">Floor {b.floor}</span>
                                    </div>
                                    <div className="text-xs font-mono opacity-80">
                                        {b.admitted_at ? new Date(b.admitted_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="text-xs font-mono" style={{ color: "var(--warning)" }}>
                                        {b.expected_discharge ? new Date(b.expected_discharge).toLocaleDateString() : 'TBD'}
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest border transition-all hover:bg-accent hover:text-black"
                                            style={{ borderColor: "var(--border-active)", color: "var(--accent)" }}>
                                            View File <ArrowRight size={10} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-md border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-xs font-mono uppercase tracking-widest">Upcoming Admissions</span>
                    </div>
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="flex justify-between items-center text-xs p-2 rounded-sm bg-black/20 border border-white/5">
                                <span className="font-mono">Patient_ID_00{i + 5}</span>
                                <span className="opacity-60">14:00 Today</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 rounded-md border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Mail size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-xs font-mono uppercase tracking-widest">Clinical Handover</span>
                    </div>
                    <p className="text-[10px] italic opacity-60 leading-relaxed">
                        Ward B handover in progress. 14 patients stabilized. 2 transfers pending to ICU. Nurse supervisor: Sarah J.
                    </p>
                </div>
                <div className="p-4 rounded-md border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Phone size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-xs font-mono uppercase tracking-widest">Rapid Response</span>
                    </div>
                    <button className="w-full py-2 rounded-sm bg-critical/10 border border-critical text-critical font-mono text-[10px] uppercase tracking-widest hover:bg-critical hover:text-white transition-all">
                        Initiate MET Call
                    </button>
                </div>
            </div>
        </div>
    )
}
