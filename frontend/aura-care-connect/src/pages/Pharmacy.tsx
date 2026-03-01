import { motion } from "framer-motion";
import { Pill, AlertTriangle, Loader2 } from "lucide-react";
import { usePharmacyStock } from "@/hooks/useQueries";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Pharmacy() {
  const { data: stockData, isLoading } = usePharmacyStock();

  const inventory = (stockData || []).map((drug: any) => {
    let status = "ok";
    if (drug.stock_quantity <= drug.minimum_threshold * 0.5) status = "critical";
    else if (drug.stock_quantity <= drug.minimum_threshold) status = "low";
    
    return {
      ...drug,
      name: drug.drug_name,
      stock: drug.stock_quantity,
      min_stock: drug.minimum_threshold,
      status
    };
  });

  const criticalItems = inventory.filter((i: any) => i.status === "critical");

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="border-b border-[#e5e7eb] pb-4 mb-2">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Hospital Pharmacy Logistics</h1>
        <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Drug Inventory & Dispensing Analytics • ACTIVE</p>
      </div>

      {/* Critical Alert */}
      {criticalItems.length > 0 && (
        <motion.div variants={item} className="clinical-card--critical p-4 border-l-4 bg-[#fffafa]">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
            <span className="text-[10px] font-mono font-bold text-[#ef4444] uppercase tracking-widest">Critical depletion detected</span>
          </div>
          <div className="space-y-3">
            {criticalItems.map((drug: any) => (
              <div key={drug.id} className="flex items-center justify-between font-mono text-xs border-b border-[#ef4444]/10 pb-2 last:border-0">
                <span className="text-[#1a1a1a] uppercase tracking-tight font-bold">{drug.name}</span>
                <span className="text-[#ef4444] font-bold">{drug.stock} <span className="text-[9px] opacity-70">REMAINING / REQ:</span> {drug.min_stock}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Inventory */}
      <motion.div variants={item} className="clinical-card p-6 bg-white">
        <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-6 font-bold">Complete Dispensary Manifest</h2>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-mono text-[#9ca3af] uppercase border-b border-[#f3f4f6] font-bold">
              <th className="text-left py-3 px-2">Medication</th>
              <th className="text-left py-3 px-2">Classification</th>
              <th className="text-center py-3 px-2">Quantity</th>
              <th className="text-center py-3 px-2">Threshold</th>
              <th className="text-center py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px]">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#9ca3af] uppercase tracking-widest font-bold">INVENTORY LOG VOID</td>
              </tr>
            ) : (
              inventory.map((drug: any) => (
                <tr key={drug.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors group">
                  <td className="py-4 px-2 font-bold text-[#1a1a1a] uppercase tracking-tight">{drug.name}</td>
                  <td className="py-4 px-2 text-[#6b7280] uppercase tracking-tighter font-bold">{drug.category}</td>
                  <td className="py-4 px-2 text-center text-[#1a1a1a] font-bold">{drug.stock} <span className="text-[9px] opacity-50 uppercase">{drug.unit}</span></td>
                  <td className="py-4 px-2 text-center text-[#9ca3af] font-bold">{drug.min_stock}</td>
                  <td className="py-4 px-2 text-center">
                    <span className={`px-2 py-0.5 text-[9px] border uppercase tracking-widest font-bold ${
                      drug.status === "critical" ? "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/5" :
                      drug.status === "low" ? "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5" :
                      "border-[#14b8a6]/30 text-[#14b8a6] bg-[#14b8a6]/5"
                    }`}>{drug.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
