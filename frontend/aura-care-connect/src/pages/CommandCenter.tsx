import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Bed,
  Activity,
  Users,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { 
  useHealthScore, 
  useKPIs, 
  useWardWorkload, 
  useActiveAlerts,
  useProactiveAlert,
  usePatientFlow
} from "@/hooks/useQueries";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function HealthScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "text-[#14b8a6]" : score >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]";
  const strokeColor = score >= 80 ? "hsl(172, 80%, 40%)" : score >= 60 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width="180" height="180" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          className={`text-5xl font-bold font-mono tracking-tighter ${color}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {score}
        </motion.span>
        <p className="text-[10px] font-mono text-[#9ca3af] tracking-[0.2em] mt-1 uppercase">Vitals Index</p>
      </div>
    </div>
  );
}

function PatientFlowChart() {
  const { data: flowData } = usePatientFlow();
  const chartData = flowData || [];

  if (chartData.length === 0) {
    return <p className="text-xs font-mono text-[#615754]">SYNCING FLOW DATA...</p>;
  }

  return (
    <div className="h-56 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} 
            tickLine={false} 
            axisLine={{ stroke: '#e5e7eb' }} 
          />
          <YAxis 
            tick={{ fill: "#6b7280", fontSize: 9, fontFamily: 'DM Mono' }} 
            tickLine={false} 
            axisLine={{ stroke: '#e5e7eb' }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#ffffff", 
              border: "1px solid #e5e7eb", 
              borderRadius: "0px", 
              fontSize: "10px", 
              fontFamily: 'DM Mono',
              color: "#1a1a1a" 
            }} 
          />
          <Area type="monotone" dataKey="admissions" stroke="#e35d3d" fill="#e35d3d" fillOpacity={0.05} strokeWidth={2} name="Admissions" />
          <Area type="monotone" dataKey="discharges" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.05} strokeWidth={2} name="Discharges" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  variant = "default",
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: any;
  trend?: "up" | "down";
  variant?: "default" | "warning" | "critical";
}) {
  const variantClass = 
    variant === "critical" ? "clinical-card--critical" : 
    variant === "warning" ? "clinical-card--warning" : 
    "clinical-card";

  return (
    <motion.div variants={item} className={`${variantClass} p-5 bg-white`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 border border-[#e5e7eb] flex items-center justify-center bg-[#f9fafb]">
          <Icon className="w-4 h-4 text-[#e35d3d]" />
        </div>
        {trend && (
          <span className={`font-mono text-[10px] font-bold flex items-center ${trend === "up" ? "text-[#14b8a6]" : "text-[#ef4444]"}`}>
            {trend === "up" ? "▲" : "▼"}{(Math.random() * 5).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="kpi-value">{value}</p>
      <div className="mt-2 space-y-0.5">
        <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-wider font-bold">{title}</p>
        <p className="text-[11px] text-[#6b7280] truncate font-medium">{sub}</p>
      </div>
    </motion.div>
  );
}

function OccupancyBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-[#ef4444]" : pct >= 75 ? "bg-[#f59e0b]" : "bg-[#14b8a6]";
  return (
    <div className="w-full h-1.5 bg-[#f3f4f6] overflow-hidden">
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export default function CommandCenter() {
  const queryClient = useQueryClient();
  const { data: healthScoreRaw, isLoading: isHealthLoading } = useHealthScore();
  const { data: kpisRaw, isLoading: isKPIsLoading } = useKPIs();
  const { data: wardWorkloadRaw, isLoading: isWardLoading } = useWardWorkload();
  const { data: alertsRaw, isLoading: isAlertsLoading } = useActiveAlerts();
  const { data: proactiveAlert } = useProactiveAlert();

  const isLoading = isHealthLoading || isKPIsLoading || isWardLoading || isAlertsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Data Mapping
  const displayHealthScore = {
    overall_score: healthScoreRaw?.score || 0,
    trend: healthScoreRaw?.trend || "stable",
    factors: {
      beds: healthScoreRaw?.breakdown?.beds?.score || 0,
      er: healthScoreRaw?.breakdown?.er?.score || 0,
      pharmacy: healthScoreRaw?.breakdown?.pharmacy?.score || 0,
      alerts: healthScoreRaw?.breakdown?.alerts?.score || 0,
      staff: healthScoreRaw?.breakdown?.staff?.score || 0,
      labs: healthScoreRaw?.breakdown?.labs?.score || 0,
    }
  };

  const displayKPIs = {
    total_beds: kpisRaw?.bed_occupancy?.total || 0,
    available_beds: (kpisRaw?.bed_occupancy?.total || 0) - (kpisRaw?.bed_occupancy?.occupied || 0),
    er_avg_wait: kpisRaw?.er_status?.avg_wait_minutes || 0,
    er_patients: kpisRaw?.er_status?.queue || 0,
    er_critical: kpisRaw?.alerts?.critical || 0,
    staff_coverage_pct: kpisRaw?.staff?.coverage_pct || 0,
    staff_on_duty: kpisRaw?.staff?.on_duty || 0,
    labs_pending: kpisRaw?.pending_labs_overdue || 0,
    labs_critical: 0,
  };

  const displayWardWorkload = (wardWorkloadRaw || []).map((w: any) => ({
    ward: w.ward,
    capacity: w.total_beds,
    occupied: w.occupied,
    nurses: w.nurses_on_duty,
    ratio: `1:${w.patient_nurse_ratio}`,
    occupancy_pct: w.occupancy_pct
  }));

  const activeAlerts = (alertsRaw || []).map((a: any) => ({
    id: a.id,
    type: a.title || a.alert_type,
    location: a.department || "General",
    timestamp: new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    severity: a.alert_type,
    resolved: a.is_resolved
  }));

  const hasProactiveAlert = proactiveAlert?.has_alert ?? false;

  const handleResolveAlert = async (id: number) => {
    try {
      await api.resolveAlert(id);
      queryClient.invalidateQueries({ queryKey: ["activeAlerts"] });
      queryClient.invalidateQueries({ queryKey: ["healthScore"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Editorial Header */}
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1a1a1a]">Hospital Command Center</h1>
          <p className="font-mono text-[10px] text-[#9ca3af] tracking-[0.3em] font-bold mt-1 uppercase">Centralized Health System Telemetry • ACTIVE</p>
        </div>
        <div className="text-right font-mono text-[10px] text-[#9ca3af] font-bold">
          SYS_NODE: <span className="text-[#6b7280]">HOS-TX-902</span><br/>
          UPLINK: <span className="text-[#e35d3d] animate-pulse">ESTABLISHED</span>
        </div>
      </div>

      {hasProactiveAlert && (
        <motion.div
          variants={item}
          className="clinical-card--warning p-4 border-l-4 flex items-center justify-between bg-[#fffbeb]"
        >
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            <p className="font-mono text-xs text-[#92400e] font-bold tracking-tight uppercase">
              System Insight: {proactiveAlert?.message}
            </p>
          </div>
          <button className="font-mono text-[10px] text-[#92400e]/60 hover:text-[#92400e] uppercase font-bold p-1">ACKNOWLEDGE</button>
        </motion.div>
      )}

      {/* Asymmetric Grid Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Main Column (9 cols) */}
        <div className="col-span-9 space-y-6">
          {/* row 1: KPI Strip (3 items) */}
          <div className="grid grid-cols-3 gap-4">
            <KPICard
              title="Bed Capacity"
              value={`${displayKPIs.available_beds}/${displayKPIs.total_beds}`}
              sub="Syncing across all wards"
              icon={Bed}
            />
            <KPICard
              title="ER Throughput"
              value={`${displayKPIs.er_avg_wait}m`}
              sub={`${displayKPIs.er_patients} in queue • ${displayKPIs.er_critical} crit`}
              icon={Activity}
              variant={displayKPIs.er_critical > 5 ? "critical" : "default"}
            />
            <KPICard
              title="Staffing Sync"
              value={`${displayKPIs.staff_coverage_pct}%`}
              sub={`${displayKPIs.staff_on_duty} specialized units active`}
              icon={Users}
            />
          </div>

          {/* row 2: Asymmetric charts */}
          <div className="grid grid-cols-10 gap-6">
            {/* Admissions flow (60%) */}
            <div className="col-span-6 clinical-card bg-white">
              <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-4 font-bold">Patient Velocity (30D)</h2>
              <PatientFlowChart />
            </div>
            {/* Health Score Gauge (40%) */}
            <div className="col-span-4 clinical-card flex flex-col items-center justify-center bg-white">
              <HealthScoreGauge score={displayHealthScore.overall_score} />
            </div>
          </div>

          {/* row 3: Ward Data (full width of 9-col span) */}
          <div className="clinical-card bg-white">
            <h2 className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest border-b border-[#f3f4f6] pb-3 mb-4 font-bold">Sector Deployment manifest</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-mono text-[#9ca3af] uppercase border-b border-[#f3f4f6] font-bold">
                    <th className="text-left py-3 px-2">Sector Unit</th>
                    <th className="text-center py-3 px-2">Limit</th>
                    <th className="text-center py-3 px-2">LOAD</th>
                    <th className="text-center py-3 px-2">Clinical</th>
                    <th className="text-center py-3 px-2">Ratio</th>
                    <th className="text-left py-3 px-2 w-48">Bandwidth</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px]">
                  {displayWardWorkload.map((ward: any) => (
                    <tr key={ward.ward} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors group">
                      <td className="py-4 px-2 text-[#1a1a1a] font-bold uppercase">{ward.ward}</td>
                      <td className="py-4 px-2 text-center text-[#9ca3af]">{ward.capacity}</td>
                      <td className="py-4 px-2 text-center text-[#1a1a1a] font-bold">{ward.occupied}</td>
                      <td className="py-4 px-2 text-center text-[#9ca3af]">{ward.nurses}</td>
                      <td className="py-4 px-2 text-center text-[#e35d3d] font-bold">{ward.ratio}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <OccupancyBar pct={ward.occupancy_pct} />
                          <span className="text-[9px] font-bold w-6 text-right text-[#6b7280]">{ward.occupancy_pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts (3 cols) - Sticky */}
        <div className="col-span-3 sticky top-20 space-y-4">
          <div className="clinical-card--critical bg-[#fffafa] h-screen-offset overflow-y-auto">
            <h2 className="text-[10px] font-mono text-[#ef4444] uppercase tracking-[0.2em] border-b border-[#ef4444]/10 pb-3 mb-4 font-bold">Active Signal Disruptions</h2>
            <div className="space-y-4">
              {activeAlerts.length === 0 ? (
                <p className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-tighter font-bold">CLEAR SIGNAL • NO ANOMALIES</p>
              ) : (
                activeAlerts.map((alert: any) => (
                  <div key={alert.id} className="border-b border-[#f3f4f6] pb-4 last:border-0 group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-mono px-2 py-0.5 border uppercase font-bold ${
                        alert.severity === "critical" ? "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/5" : "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] font-mono text-[#9ca3af] font-bold">{alert.timestamp}</span>
                    </div>
                    <p className="text-[12px] font-bold text-[#1a1a1a] leading-tight mb-1 uppercase tracking-tight">{alert.type}</p>
                    <p className="text-[10px] font-mono text-[#6b7280] uppercase tracking-tighter mb-2 font-medium">{alert.location}</p>
                    <button 
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-[9px] font-mono text-[#e35d3d] hover:underline uppercase font-bold"
                    >
                      Clear Link
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="clinical-card--info p-4 bg-[#f0f9ff]">
            <p className="text-[9px] font-mono text-[#0369a1] font-bold uppercase mb-1">Compute Load</p>
            <div className="text-xl font-mono text-[#0c4a6e] font-bold mb-2">92.4%</div>
            <div className="h-1 bg-[#bae6fd]">
              <div className="h-full bg-[#0ea5e9]" style={{ width: '92.4%' }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
