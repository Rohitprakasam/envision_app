// API Client for interacting with the FastAPI Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const fetchWithConfig = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const api = {
  // Command Center (Analytics)
  getHealthScore: () => fetchWithConfig("/analytics/health-score"),
  getKPIs: () => fetchWithConfig("/analytics/kpis"),
  getWardWorkload: () => fetchWithConfig("/analytics/ward-workload"),
  getPatientFlow: () => fetchWithConfig("/analytics/patient-flow"),

  // EMR / Patient Directory (Beds)
  getAllBeds: () => fetchWithConfig("/beds/all"),
  getBedSummary: () => fetchWithConfig("/beds/summary"),
  updateBedStatus: (bedId: number, status: string) =>
    fetchWithConfig(`/beds/${bedId}/status?status=${status}`, {
      method: "PUT",
    }),

  // ER Console (Emergency)
  getERStatus: () => fetchWithConfig("/er/status"),
  getERPatients: () => fetchWithConfig("/er/patients"),
  getERWaitTrend: () => fetchWithConfig("/er/wait-trend"),

  // Pharmacy Module
  getPharmacyStock: () => fetchWithConfig("/pharmacy/stock"),
  getPharmacyLowStock: () => fetchWithConfig("/pharmacy/low-stock"),
  getPharmacyPrescriptions: () => fetchWithConfig("/pharmacy/prescriptions"),

  // Lab Results
  getLabsPending: () => fetchWithConfig("/labs/pending"),
  getLabsCritical: () => fetchWithConfig("/labs/critical"),
  getLabsTurnaroundStats: () => fetchWithConfig("/labs/turnaround-stats"),

  // Staff & OT
  getStaffSummary: () => fetchWithConfig("/staff/summary"),
  getOTSchedule: () => fetchWithConfig("/ot/schedule"),

  // Predictive Intelligence
  getERWaitForecast: () => fetchWithConfig("/predictions/er-wait"),
  getBedShortageProbability: () => fetchWithConfig("/predictions/bed-shortage"),
  getReadmissionRisk: () => fetchWithConfig("/predictions/readmission-risk"),

  // Alerts
  getActiveAlerts: () => fetchWithConfig("/alerts/active"),
  getAlertSummary: () => fetchWithConfig("/alerts/summary"),
  resolveAlert: (alertId: number) =>
    fetchWithConfig(`/alerts/${alertId}/resolve`, { method: "PUT" }),

  // Global AI Copilot (Chatbot)
  sendChatbotMessage: (message: string, history: any[] = []) =>
    fetchWithConfig("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message, conversation_history: history }),
    }),
  getProactiveAlert: () => fetchWithConfig("/chatbot/proactive-alert"),
};
