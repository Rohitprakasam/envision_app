import { useState, useEffect } from "react"
import { Users2, CalendarDays, Clock, MapPin, UserCheck, Scissors } from "lucide-react"
import api from "../lib/api"
import { motion } from "framer-motion"

export default function Staff() {
    const [staff, setStaff] = useState([])
    const [surgeries, setSurgeries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, otRes] = await Promise.all([
                    api.get("/api/staff/summary"),
                    api.get("/api/ot/schedule")
                ])
                setStaff(sRes.data)
                setSurgeries(otRes.data)
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
                        <Users2 className="inline mr-2 text-accent" />
                        Staff & OT Management
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Personnel allocation and surgical theater coordination.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-sm border bg-black/20" style={{ borderColor: "var(--border)" }}>
                        <div className="text-[10px] font-mono uppercase opacity-40">Active OT</div>
                        <div className="text-lg font-bold font-mono">4 / 6</div>
                    </div>
                    <button className="bg-accent text-black px-4 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2">
                        <Scissors size={14} /> Schedule Surgery
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-2 rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <UserCheck size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Staff Duty Status</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Scanning biometric logs...</div>
                        ) : (
                            staff.map((role, i) => (
                                <div key={i} className="p-4 border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest">{role.role}S</span>
                                        <span className="text-[10px] font-mono opacity-60">{role.on_duty} / {role.scheduled} ON-DUTY</span>
                                    </div>
                                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent" style={{ width: `${(role.on_duty / role.scheduled) * 100}%` }} />
                                    </div>
                                    <div className="mt-2 flex gap-4 text-[10px] font-mono opacity-40 uppercase">
                                        <span>ACTIVE: {role.on_duty}</span>
                                        <span>BREAK: 2</span>
                                        <span>OFF: {role.scheduled - role.on_duty}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 rounded-md border flex flex-col overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
                    <div className="p-4 border-b bg-black/20 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                        <CalendarDays size={14} style={{ color: "var(--accent)" }} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Surgical Theater Timeline</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 animate-pulse">Loading OT booking matrix...</div>
                        ) : surgeries.length === 0 ? (
                            <div className="p-20 text-center font-mono text-xs opacity-40 font-mono italic">No surgeries scheduled for the next 48 hours.</div>
                        ) : (
                            surgeries.map(s => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    key={s.id}
                                    className="p-4 border-b last:border-0 hover:bg-white/5 transition-colors flex items-center gap-4"
                                    style={{ borderColor: "var(--border)" }}
                                >
                                    <div className="w-16 flex flex-col items-center justify-center border-r pr-4" style={{ borderColor: "var(--border)" }}>
                                        <span className="text-xs font-bold font-mono text-accent">
                                            {new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-[8px] font-mono opacity-40 uppercase">TODAY</span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{s.procedure_name}</span>
                                            <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-black/40 border border-white/10 uppercase tracking-widest opacity-60">
                                                {s.complexity || 'Routine'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] font-mono opacity-40 uppercase flex items-center gap-1">
                                                <UserCheck size={10} /> DR. {s.surgeon_name}
                                            </span>
                                            <span className="text-[10px] font-mono opacity-40 uppercase flex items-center gap-1">
                                                <MapPin size={10} /> {s.theatre_name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-mono uppercase tracking-widest ${s.status === 'scheduled' ? 'border-accent text-accent' : 'border-success text-success'}`}>
                                            {s.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-md border bg-warning/5 border-warning/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Clock className="text-warning" size={20} />
                    <div className="text-[10px] font-mono uppercase opacity-60 leading-tight">
                        Critical surgical backlog in OT-3. Estimated delay: <span className="text-warning font-bold">45 minutes</span>. <br />
                        Nurse re-allocation suggested for afternoon shift.
                    </div>
                </div>
                <button className="px-4 py-2 border border-warning/40 text-warning rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-warning/10 transition-all">
                    Reassign Staff
                </button>
            </div>
        </div>
    )
}
