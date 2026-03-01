import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Polling Intervals (ms)
const REFRESH_RATE = {
  DASHBOARD_KPI: 30000,
  ER_PATIENTS: 10000,
  CRITICAL_ALERTS: 5000,
};

// ==========================================
// Command Center (Analytics)
// ==========================================
export const useHealthScore = () =>
  useQuery({
    queryKey: ["healthScore"],
    queryFn: api.getHealthScore,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useKPIs = () =>
  useQuery({
    queryKey: ["kpis"],
    queryFn: api.getKPIs,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useWardWorkload = () =>
  useQuery({
    queryKey: ["wardWorkload"],
    queryFn: api.getWardWorkload,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const usePatientFlow = () =>
  useQuery({
    queryKey: ["patientFlow"],
    queryFn: api.getPatientFlow,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// EMR / Patient Directory (Beds)
// ==========================================
export const useAllBeds = () =>
  useQuery({
    queryKey: ["allBeds"],
    queryFn: api.getAllBeds,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useBedSummary = () =>
  useQuery({
    queryKey: ["bedSummary"],
    queryFn: api.getBedSummary,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// ER Console (Emergency)
// ==========================================
export const useERStatus = () =>
  useQuery({
    queryKey: ["erStatus"],
    queryFn: api.getERStatus,
    refetchInterval: REFRESH_RATE.ER_PATIENTS,
  });

export const useERPatients = () =>
  useQuery({
    queryKey: ["erPatients"],
    queryFn: api.getERPatients,
    refetchInterval: REFRESH_RATE.ER_PATIENTS,
  });

export const useERWaitTrend = () =>
  useQuery({
    queryKey: ["erWaitTrend"],
    queryFn: api.getERWaitTrend,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// Pharmacy Module
// ==========================================
export const usePharmacyStock = () =>
  useQuery({
    queryKey: ["pharmacyStock"],
    queryFn: api.getPharmacyStock,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const usePharmacyLowStock = () =>
  useQuery({
    queryKey: ["pharmacyLowStock"],
    queryFn: api.getPharmacyLowStock,
    refetchInterval: REFRESH_RATE.ER_PATIENTS,
  });

// ==========================================
// Lab Results
// ==========================================
export const useLabsPending = () =>
  useQuery({
    queryKey: ["labsPending"],
    queryFn: api.getLabsPending,
    refetchInterval: REFRESH_RATE.ER_PATIENTS, // Frequent updates for tests
  });

export const useLabsCritical = () =>
  useQuery({
    queryKey: ["labsCritical"],
    queryFn: api.getLabsCritical,
    refetchInterval: REFRESH_RATE.CRITICAL_ALERTS, // Immediate attention
  });

export const useLabsTurnaroundStats = () =>
  useQuery({
    queryKey: ["labsTurnaroundStats"],
    queryFn: api.getLabsTurnaroundStats,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// Staff & OT
// ==========================================
export const useStaffSummary = () =>
  useQuery({
    queryKey: ["staffSummary"],
    queryFn: api.getStaffSummary,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useOTSchedule = () =>
  useQuery({
    queryKey: ["otSchedule"],
    queryFn: api.getOTSchedule,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// Predictive Intelligence
// ==========================================
export const useERWaitForecast = () =>
  useQuery({
    queryKey: ["erWaitForecast"],
    queryFn: api.getERWaitForecast,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useBedShortageProbability = () =>
  useQuery({
    queryKey: ["bedShortageProbability"],
    queryFn: api.getBedShortageProbability,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

export const useReadmissionRisk = () =>
  useQuery({
    queryKey: ["readmissionRisk"],
    queryFn: api.getReadmissionRisk,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// CV Monitor / Edge Vision
// ==========================================
export const useActiveAlerts = () =>
  useQuery({
    queryKey: ["activeAlerts"],
    queryFn: api.getActiveAlerts,
    refetchInterval: REFRESH_RATE.CRITICAL_ALERTS,
  });

export const useAlertSummary = () =>
  useQuery({
    queryKey: ["alertSummary"],
    queryFn: api.getAlertSummary,
    refetchInterval: REFRESH_RATE.DASHBOARD_KPI,
  });

// ==========================================
// Global AI Copilot (Chatbot)
// ==========================================
export const useProactiveAlert = () =>
  useQuery({
    queryKey: ["proactiveAlert"],
    queryFn: api.getProactiveAlert,
    refetchInterval: REFRESH_RATE.ER_PATIENTS,
  });
