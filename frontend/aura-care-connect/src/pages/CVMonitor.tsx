import { motion } from "framer-motion";
import { Eye, CheckCircle, Loader2 } from "lucide-react";
import { useActiveAlerts } from "@/hooks/useQueries";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function CVMonitor() {
  const queryClient = useQueryClient();
  const { data: alertsData, isLoading } = useActiveAlerts();

  const handleResolve = async (id: number) => {
    try {
      await api.resolveAlert(id);
      queryClient.invalidateQueries({ queryKey: ["activeAlerts"] });
      queryClient.invalidateQueries({queryKey: ["healthScore"]});
      queryClient.invalidateQueries({queryKey: ["kpis"]});
    } catch (error) {
      console.error(error);
    }
  };

  const alerts = (alertsData || []).map((a: any) => ({
    id: a.id,
    type: a.title || a.alert_type,
    location: a.department || "General",
    timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: a.alert_type,
    resolved: a.is_resolved
  }));

  if (isLoading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Visual Intelligence Monitor</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Computer Vision Edge Analysis • 5s POLLING ACTIVE</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <motion.div variants={item} className="clinical-card p-16 text-center border-dashed bg-white">
            <CheckCircle className="w-12 h-12 text-[#14b8a6] mx-auto mb-4 opacity-50" />
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">Sector clear — No vision anomalies detected</p>
          </motion.div>
        )}
        {alerts.map((alert: any) => (
          <motion.div
            key={alert.id}
            variants={item}
            layout
            className={`clinical-card p-4 flex items-center justify-between group bg-white ${
              alert.severity === "critical" ? "border-l-4 border-l-[#ef4444]" : "border-l-4 border-l-[#e35d3d]"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center border ${
                alert.severity === "critical" ? "border-[#ef4444]/30 bg-[#ef4444]/5" : "border-[#e35d3d]/30 bg-[#e35d3d]/5"
              }`}>
                <Eye className={`w-5 h-5 ${alert.severity === "critical" ? "text-[#ef4444]" : "text-[#e35d3d]"}`} />
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-[#1a1a1a] uppercase tracking-widest">{alert.type}</p>
                <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-tighter mt-1 font-bold">
                  Loc: {alert.location} <span className="mx-2 opacity-30">|</span> Sync: {alert.timestamp}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResolve(alert.id)}
              className="px-4 py-2 text-[10px] font-mono uppercase bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-[#e35d3d]/50 transition-colors cursor-pointer font-bold"
            >
              Clear Signal
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
