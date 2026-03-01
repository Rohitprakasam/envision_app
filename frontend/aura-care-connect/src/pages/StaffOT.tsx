import { motion } from "framer-motion";
import { Users, Stethoscope, Loader2 } from "lucide-react";
import { useStaffSummary, useOTSchedule } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function StaffOT() {
  const { data: staffData, isLoading: isStaffLoading } = useStaffSummary();
  const { data: otData, isLoading: isOTLoading } = useOTSchedule();

  const isLoading = isStaffLoading || isOTLoading;

  // Backend returns { by_role: { doctor: {total, on_duty}, nurse: {total, on_duty}, ... } }
  // Transform into array for rendering
  const staffSummary = staffData?.by_role
    ? Object.entries(staffData.by_role).map(([role, data]: [string, any]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        on_duty: data.on_duty,
        total: data.total,
        coverage: data.total > 0 ? Math.round((data.on_duty / data.total) * 100) : 100,
      }))
    : [];
  const otSchedule = otData || [];

  if (isLoading && staffSummary.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Personnel & OT Command</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Unit Deployment & Surgical Scheduling • SYNCED</p>
      </div>

      {/* Staff Coverage */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Staffing Coverage Telemetry</h2>
        <div className="space-y-6">
          {staffSummary.length === 0 ? (
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase font-bold">NO DEPLOYMENT DATA FOUND</p>
          ) : (
            staffSummary.map((s: any) => {
               const coverage = s.coverage || 100;
               return (
                <div key={s.role} className="flex items-center gap-6 group">
                  <span className="text-[11px] font-mono text-[#6b7280] uppercase w-24 tracking-tighter font-bold">{s.role}</span>
                  <div className="flex-1 h-1.5 bg-[#f3f4f6] overflow-hidden">
                    <motion.div
                      className={`h-full ${coverage >= 90 ? "bg-[#14b8a6]" : coverage >= 80 ? "bg-[#f59e0b]" : "bg-[#ef4444]"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(coverage, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-baseline gap-2 w-28 justify-end">
                    <span className="text-lg font-mono font-bold text-[#1a1a1a] tracking-tighter">{coverage}%</span>
                    <span className="text-[9px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">{s.on_duty}/{s.total}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* OT Schedule */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Theatre Operational Log</h2>
        <div className="space-y-3">
          {otSchedule.length === 0 ? (
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase font-bold">NO SCHEDULED PROCEDURES</p>
          ) : (
            otSchedule.map((op: any) => (
              <div key={op.id} className="flex items-center justify-between p-4 bg-[#f9fafb] border border-[#e5e7eb] group hover:border-[#e35d3d]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 border border-[#e5e7eb] flex items-center justify-center bg-white shadow-sm">
                    <Stethoscope className="w-4 h-4 text-[#e35d3d]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] tracking-tight uppercase">{op.procedure || op.procedure_name}</p>
                    <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">{op.surgeon} • {op.room || op.ot_room}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-base font-mono font-bold text-[#1a1a1a] tracking-tighter">
                    {op.time || (op.scheduled_at ? new Date(op.scheduled_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : "TDB")}
                  </p>
                  <span className={`text-[9px] font-mono uppercase tracking-widest p-1 border font-bold ${
                    op.status === "in_progress" || op.status === "In Progress" ? "text-[#14b8a6] border-[#14b8a6]/30 bg-[#14b8a6]/5" : 
                    op.status === "prep" || op.status === "Prep" ? "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5" : 
                    "text-[#6b7280] border-[#e5e7eb]"
                  }`}>{op.status?.replace("_", " ")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
