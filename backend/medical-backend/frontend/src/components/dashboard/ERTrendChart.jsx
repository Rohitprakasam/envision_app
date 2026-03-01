import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Clock, TrendingDown } from "lucide-react"
import api from "../../lib/api"

export default function ERTrendChart() {
    const [data, setData] = useState([])

    useEffect(() => {
        let int
        const load = async () => {
            try {
                const trend = await api.get("/api/er/wait-trend")
                const pred = await api.get("/api/predictions/er-wait")

                let chartData = trend.data.map(d => ({
                    time: d.hour,
                    actual: d.wait_minutes,
                    predicted: null
                }))

                if (chartData.length > 0) {
                    const last = chartData[chartData.length - 1]
                    chartData.push({
                        time: "Now+2h",
                        actual: null,
                        predicted: pred.data[1] ? pred.data[1].predicted_wait : (pred.data.predicted_wait_time_minutes || 0)
                    })

                    // Connect the lines internally by overlapping the last actual point
                    chartData[chartData.length - 2].predicted = last.actual
                }
                setData(chartData)
            } catch (e) {
                console.error(e)
            }
        }
        load()
        int = setInterval(load, 30000)
        return () => clearInterval(int)
    }, [])

    if (!data.length) return (
        <div className="rounded-md p-5 h-[350px] animate-pulse"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }} />
    )

    return (
        <div className="rounded-md p-5 h-full flex flex-col"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Clock size={16} style={{ color: "var(--accent)" }} />
                    ER Wait Time Trend & AI Forecast
                </h3>
                <div className="flex gap-4 text-[10px] font-mono top-right">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "var(--text-secondary)" }} /> Actual</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "var(--warning)" }} /> XGBoost Prediction</div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} fontFamily="DM Mono" tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} fontFamily="DM Mono" tickLine={false} axisLine={false} tickFormatter={v => `${v}m`} />
                        <Tooltip
                            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", fontFamily: "DM Mono" }}
                            itemStyle={{ color: "var(--text-primary)" }}
                            labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
                        />
                        <ReferenceLine y={120} stroke="var(--critical)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'SLA Limit (120m)', fill: 'var(--critical)', fontSize: 10, fontFamily: 'DM Mono' }} />

                        <Line type="monotone" dataKey="actual" stroke="var(--text-secondary)" strokeWidth={2} dot={{ fill: "var(--bg-surface)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="predicted" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "var(--bg-surface)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
