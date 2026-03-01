import { motion } from "framer-motion";
import { Activity, Clock, AlertTriangle, Users, Loader2 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useERStatus, useERPatients, useERWaitTrend } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function VitalsBadge({ label, value, status }: { label: string; value: string | number; status: "normal" | "warning" | "critical" }) {
  const cls = status === "critical" ? "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/5" :
              status === "warning" ? "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5" :
              "text-[#14b8a6] border-[#14b8a6]/30 bg-[#14b8a6]/5";
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] font-mono border font-bold ${cls} uppercase tracking-tighter`}>
      {label}: {value}
    </span>
  );
}

function getSpO2Status(v: number): "normal" | "warning" | "critical" {
  if (!v) return "normal";
  return v < 94 ? "critical" : v < 97 ? "warning" : "normal";
}

function getBPStatus(bp: string): "normal" | "warning" | "critical" {
  if (!bp) return "normal";
  const sys = parseInt(bp.split("/")[0]);
  return sys >= 180 ? "critical" : sys >= 140 ? "warning" : "normal";
}

function TriageBadge({ level }: { level: number }) {
  const labels = ["", "Resuscitation", "Emergent", "Urgent", "Less Urgent", "Non-Urgent"];
  const colors = [
    "", 
    "bg-[#ef4444] text-white font-bold", 
    "bg-[#f59e0b] text-black font-bold", 
    "bg-[#e35d3d] text-white font-bold", 
    "bg-[#14b8a6] text-white font-bold", 
    "bg-[#f3f4f6] text-[#6b7280] font-bold"
  ];
  return (
    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${colors[level] || colors[5]}`}>
      {labels[level] || `L-${level}`}
    </span>
  );
}

export default function ERConsole() {
  const { data: statusData, isLoading: isStatusLoading } = useERStatus();
  const { data: patientsData, isLoading: isPatientsLoading } = useERPatients();
  const { data: trendData, isLoading: isTrendLoading } = useERWaitTrend();

  const isLoading = isStatusLoading || isPatientsLoading || isTrendLoading;
  
  const erStatus = statusData || { queue_length: 0, avg_wait_minutes: 0, critical_count: 0, beds_available: 0, beds_total: 0 };
  const patients = patientsData || [];
  const waitTrend = trendData || [];

  if (isLoading && (!patients || patients.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Emergency Command Console</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Real-time Triage Telemetry • 10s SECTOR POLLING ACTIVE</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Queue Length", value: erStatus.queue_length || erStatus.queue || 0, icon: Users, sub: "Patients pending" },
          { label: "Avg Wait", value: `${erStatus.avg_wait_minutes || erStatus.avg_wait_min || 0}m`, icon: Clock, sub: "Triage throughput" },
          { label: "Crit Alerts", value: erStatus.critical_count || 0, icon: AlertTriangle, sub: "Level 1 Priority" },
          { label: "Bed Status", value: `${erStatus.beds_available || 0}/${erStatus.beds_total || 0}`, icon: Activity, sub: "Unit capacity" },
        ].map((card) => (
          <motion.div key={card.label} variants={item} className="clinical-card p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className="w-3.5 h-3.5 text-[#e35d3d]" />
              <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">{card.label}</span>
            </div>
            <p className="kpi-value">{card.value}</p>
            <p className="text-[10px] font-mono text-[#6b7280] uppercase mt-1 font-bold">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Wait Trend Chart */}
      {waitTrend.length > 0 && (
        <motion.div variants={item} className="clinical-card p-6 bg-white">
          <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Sector Throughput Velocity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waitTrend}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0px",
                    fontSize: "10px",
                    fontFamily: 'DM Mono',
                    color: "#1a1a1a",
                  }}
                />
                <Area type="monotone" dataKey="wait_time" stroke="#e35d3d" fill="#e35d3d" fillOpacity={0.05} strokeWidth={2} name="Wait Time" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Triage Queue */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Unit Triage Worklist</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-mono text-[#9ca3af] uppercase border-b border-[#f3f4f6] font-bold">
                <th className="text-left py-3 px-2">Identifier</th>
                <th className="text-left py-3 px-2">Subject</th>
                <th className="text-left py-3 px-2">Priority</th>
                <th className="text-left py-3 px-2">Diagnostics</th>
                <th className="text-left py-3 px-2 text-center">Telemetry</th>
                <th className="text-center py-3 px-2">Latency</th>
                <th className="text-center py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px]">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#9ca3af] uppercase tracking-widest font-bold">ZERO ACTIVE SUBJECTS IN SECTOR</td>
                </tr>
              ) : (
                patients.map((p: any) => (
                  <motion.tr
                    key={p.id}
                    className={`border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors ${p.triage_level === 1 ? "bg-[#ef4444]/5" : ""}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-4 px-2 text-[#6b7280] font-bold">ER.{String(p.id).padStart(3, '0')}</td>
                    <td className="py-4 px-2">
                      <p className="font-bold text-[#1a1a1a] tracking-tighter text-sm uppercase">{p.name}</p>
                      <p className="text-[9px] text-[#9ca3af] uppercase font-bold">Age: {p.age}</p>
                    </td>
                    <td className="py-4 px-2"><TriageBadge level={p.triage_level} /></td>
                    <td className="py-4 px-2 text-[#6b7280] uppercase tracking-tighter truncate max-w-[150px] font-bold">{p.chief_complaint}</td>
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {p.vitals_bp && <VitalsBadge label="BP" value={p.vitals_bp} status={getBPStatus(p.vitals_bp)} />}
                        {p.vitals_spo2 && <VitalsBadge label="O2" value={`${p.vitals_spo2}%`} status={getSpO2Status(p.vitals_spo2)} />}
                        {p.vitals_pulse && <VitalsBadge label="HR" value={p.vitals_pulse} status={p.vitals_pulse > 100 ? "warning" : "normal"} />}
                        {!p.vitals_bp && !p.vitals_spo2 && !p.vitals_pulse && <span className="text-[#e5e7eb]">··</span>}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-[#1a1a1a] font-bold">
                      {p.wait_minutes > 0 ? `${p.wait_minutes}M` : "SYNC"}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-mono border uppercase tracking-widest font-bold ${
                        p.status === "in_treatment" || p.status === "In Treatment" ? "border-[#14b8a6]/30 text-[#14b8a6] bg-[#14b8a6]/5" : "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5"
                      }`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
