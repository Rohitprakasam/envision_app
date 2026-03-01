import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { BedDouble } from "lucide-react"
import api from "../../lib/api"

export default function BedSummaryChart() {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetch = () => api.get("/api/beds/summary").then(r => setData(r.data)).catch(console.error)
        fetch()
        const int = setInterval(fetch, 15000)
        return () => clearInterval(int)
    }, [])

    if (!data.length) return (
        <div className="rounded-md p-5 h-[350px] animate-pulse"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }} />
    )

    return (
        <div className="rounded-md p-5 h-full flex flex-col"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-medium mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <BedDouble size={16} style={{ color: "var(--accent)" }} />
                Ward Occupancy
            </h3>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="ward" stroke="var(--text-secondary)" fontSize={10} fontFamily="DM Mono" tickLine={false} axisLine={false} width={60} />
                        <Tooltip
                            cursor={{ fill: "var(--bg-elevated)" }}
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "11px", fontFamily: "DM Mono" }}
                        />
                        <Bar dataKey="occupancy_pct" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => {
                                const color = entry.occupancy_pct >= 90 ? "var(--critical)" :
                                    entry.occupancy_pct >= 75 ? "var(--warning)" : "var(--accent)"
                                return <Cell key={`cell-${index}`} fill={color} />
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
