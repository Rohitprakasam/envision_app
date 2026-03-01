import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useERWaitForecast, useBedShortageProbability, useReadmissionRisk } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Predictions() {
  const { data: waitForecast, isLoading: isWaitLoading } = useERWaitForecast();
  const { data: bedShortage, isLoading: isBedLoading } = useBedShortageProbability();
  const { data: readmission, isLoading: isReadmissionLoading } = useReadmissionRisk();

  const isLoading = isWaitLoading || isBedLoading || isReadmissionLoading;

  // API returns [{hour, predicted_wait, confidence, horizon_hours}]
  // Map to chart-friendly format with computed confidence band
  const forecastData = (waitForecast || []).map((d: any) => ({
    hour: d.hour,
    predicted: d.predicted_wait,
    upper_bound: Math.round(d.predicted_wait * (1 + (1 - (d.confidence || 0.85)) * 2)),
    lower_bound: Math.round(d.predicted_wait * (1 - (1 - (d.confidence || 0.85)) * 2)),
  }));

  // API returns an array of wards — compute overall average shortage probability
  const bedShortageWards = bedShortage || [];
  const overallShortage = Array.isArray(bedShortageWards) && bedShortageWards.length > 0
    ? bedShortageWards.reduce((sum: number, w: any) => sum + (w.shortage_probability_2h || 0), 0) / bedShortageWards.length
    : 0;
  const readmissionPatients = readmission || [];
  
  const riskPct = Math.round(overallShortage * 100);

  if (isLoading && forecastData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Predictive Intelligence</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Machine Learning Operational Sync • ACTIVE</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ER Wait Forecast */}
        <motion.div variants={item} className="clinical-card p-6 col-span-1 bg-white">
          <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">ER Wait Forecast (4h)</h2>
          <div className="h-56">
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} unit="m" />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "0px", fontSize: "10px", fontFamily: 'DM Mono', color: "#1a1a1a" }} />
                  <Area type="monotone" dataKey="predicted" stroke="#e35d3d" fill="#e35d3d" fillOpacity={0.05} strokeWidth={2} name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex px-4 justify-center items-center h-full text-[#615754] font-mono text-[10px] uppercase">
                  INSUFFICIENT TELEMETRY FOR PROJECTION
                </div>
            )}
          </div>
        </motion.div>

        {/* Bed Shortage Risk */}
        <motion.div variants={item} className="clinical-card p-6 flex flex-col items-center justify-center bg-white">
          <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-10 w-full text-left font-bold">Bed Shortage Risk (4h)</h2>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r="44" fill="none"
                stroke={riskPct > 50 ? "hsl(0, 84%, 60%)" : riskPct > 25 ? "hsl(38, 92%, 50%)" : "hsl(172, 80%, 40%)"}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 44}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - riskPct / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-mono font-bold tracking-tighter ${riskPct > 50 ? "text-[#ef4444]" : riskPct > 25 ? "text-[#f59e0b]" : "text-[#14b8a6]"}`}>{riskPct}%</span>
              <span className="text-[9px] font-mono text-[#9ca3af] uppercase tracking-widest mt-1 font-bold">Shortage</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 30-Day Readmission Risk */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Readmission Risk manifest</h2>
        <div className="space-y-3">
          {readmissionPatients.length === 0 ? (
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase font-bold">NO RISK TELEMETRY DETECTED</p>
          ) : (
            readmissionPatients.map((p: any) => (
              <div key={p.patient_name} className="flex items-center justify-between p-4 bg-[#f9fafb] border border-[#e5e7eb]">
                <div className="flex gap-4 items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#e35d3d]" />
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] tracking-tight">{p.patient_name}, {p.age}</p>
                    <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-tight font-bold">{p.primary_diagnosis}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 font-mono text-sm font-bold border ${
                  p.risk_level === "critical" ? "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/5" :
                  p.risk_level === "warning" ? "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5" :
                  "border-[#14b8a6]/30 text-[#14b8a6] bg-[#14b8a6]/5"
                }`}>
                  {Math.round(p.readmission_probability_30d * 100)}%
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
