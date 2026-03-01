import { motion } from "framer-motion";
import { FlaskConical, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLabsPending, useLabsTurnaroundStats } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function LabResults() {
  const { data: pendingData, isLoading: isPendingLoading } = useLabsPending();
  const { data: tatData, isLoading: isTatLoading } = useLabsTurnaroundStats();

  const isLoading = isPendingLoading || isTatLoading;

  const labsPending = (pendingData || []).map((lab: any) => {
    // Determine overdue if API doesn't provide it directly
    const orderedTime = new Date(lab.ordered_at).getTime();
    const isOverdue = lab.overdue !== undefined ? lab.overdue : (Date.now() - orderedTime > 2 * 60 * 60 * 1000);
    
    return {
      id: lab.test_code || `LAB-${lab.id}`,
      patient: lab.patient_name,
      test: lab.test_name,
      dept: lab.category,
      ordered: new Date(lab.ordered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta_min: lab.turnaround_minutes || lab.eta_min || 0,
      overdue: isOverdue
    };
  });

  const tatStats = tatData || [];

  if (isLoading && labsPending.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Diagnostics & Labs</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Pending Analysis & Turnaround Analytics • ACTIVE</p>
      </div>

      {/* Pending Queue */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Active Diagnostics Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-mono text-[#9ca3af] uppercase border-b border-[#f3f4f6] font-bold">
                <th className="text-left py-3 px-2">Identifier</th>
                <th className="text-left py-3 px-2">Subject</th>
                <th className="text-left py-3 px-2">Diagnostic Test</th>
                <th className="text-left py-3 px-2">Sector</th>
                <th className="text-center py-3 px-2">Ordered</th>
                <th className="text-center py-3 px-2">Latency</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px]">
              {labsPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#9ca3af] uppercase tracking-widest font-bold">QUEUE SIGNAL CLEAR</td>
                </tr>
              ) : (
                labsPending.map((lab: any) => (
                  <tr key={lab.id} className={`border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors ${lab.overdue ? "bg-[#ef4444]/5" : ""}`}>
                    <td className="py-4 px-2 text-[#6b7280] font-bold">{lab.id}</td>
                    <td className="py-4 px-2 text-[#1a1a1a] uppercase tracking-tighter font-bold">{lab.patient}</td>
                    <td className="py-4 px-2 text-[#e35d3d] uppercase tracking-tighter font-bold">{lab.test}</td>
                    <td className="py-4 px-2 text-[#9ca3af] uppercase font-bold">{lab.dept}</td>
                    <td className="py-4 px-2 text-center text-[#6b7280] font-bold">{lab.ordered}</td>
                    <td className="py-4 px-2 text-center">
                      {lab.overdue ? (
                        <span className="inline-flex items-center gap-2 text-[9px] font-mono font-bold text-[#ef4444] border border-[#ef4444]/30 bg-[#ef4444]/5 px-2 py-0.5 animate-pulse">
                          CRITICAL LATENCY
                        </span>
                      ) : (
                        <span className="text-[#1a1a1a] font-bold">{lab.eta_min}m</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* TAT Chart */}
      {tatStats.length > 0 && (
        <motion.div variants={item} className="clinical-card p-6 bg-white">
          <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Unit Turnaround Latency Analytics</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tatStats}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="department" tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "0px", fontSize: "10px", fontFamily: 'DM Mono', color: "#1a1a1a" }} />
                <Bar dataKey="avg_tat" fill="#e35d3d" radius={[0, 0, 0, 0]} name="Avg TAT" />
                <Bar dataKey="target" fill="#f3f4f6" radius={[0, 0, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
