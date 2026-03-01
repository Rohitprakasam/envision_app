import { motion } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";
import { useKPIs, useAllBeds } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EMRDirectory() {
  const queryClient = useQueryClient();
  const { data: kpis, isLoading: isKpisLoading } = useKPIs();
  const { data: bedsData, isLoading: isBedsLoading } = useAllBeds();

  const isLoading = isKpisLoading || isBedsLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kpis"] });
    queryClient.invalidateQueries({ queryKey: ["allBeds"] });
  };

  const beds = bedsData || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Hospital Sector Manifest</h1>
          <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Centralized EMR / Bed Management Synchronizer</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-3 px-4 py-2 font-mono text-[10px] uppercase bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#1a1a1a] hover:border-[#e35d3d] transition-colors cursor-pointer font-bold shadow-sm"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} 
          Force Sync
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Capacity", value: kpis?.bed_occupancy?.total || 0 },
          { label: "Unit Occupancy", value: kpis?.bed_occupancy?.occupied || 0 },
          { label: "Available Capacity", value: (kpis?.bed_occupancy?.total || 0) - (kpis?.bed_occupancy?.occupied || 0) },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="clinical-card p-6 flex flex-col items-center bg-white">
            <p className="kpi-value mb-1">{s.value}</p>
            <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest font-bold">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bed Table */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Unit Deployment Registry</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-mono text-[#9ca3af] uppercase border-b border-[#f3f4f6] font-bold">
                <th className="text-left py-3 px-2">Identifier</th>
                <th className="text-left py-3 px-2">Ward Sector</th>
                <th className="text-left py-3 px-2">Level</th>
                <th className="text-left py-3 px-2">Subject Metadata</th>
                <th className="text-left py-3 px-2">Ingress Date</th>
                <th className="text-center py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px]">
              {beds.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#9ca3af] uppercase tracking-widest font-bold">REGISTRY LOG VOID</td>
                </tr>
              ) : (
                beds.map((bed: any) => (
                  <tr key={bed.id || bed.bed_number} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors group">
                    <td className="py-4 px-2 text-[#6b7280] font-bold">{bed.bed_number}</td>
                    <td className="py-4 px-2 text-[#1a1a1a] uppercase font-bold">{bed.ward}</td>
                    <td className="py-4 px-2 text-[#9ca3af] uppercase font-bold">{bed.floor}F</td>
                    <td className="py-4 px-2">
                      <p className="text-[#1a1a1a] uppercase tracking-tighter font-bold">{bed.patient_name || "—"}</p>
                    </td>
                    <td className="py-4 px-2 text-[#9ca3af] uppercase tracking-tighter font-bold">
                      {bed.admitted_at ? new Date(bed.admitted_at).toLocaleDateString() : "EMPTY"}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`px-2 py-0.5 text-[9px] border uppercase tracking-widest font-bold ${
                        bed.status === "occupied" ? "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5" : "border-[#14b8a6]/30 text-[#14b8a6] bg-[#14b8a6]/5"
                      }`}>
                        {bed.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
