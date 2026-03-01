# AOAI Frontend Integration Plan

This document provides the definitive technical specifications for the frontend team to integrate with the AOAI backend intelligence layer.

## 📡 General Connection
- **Base URL**: `http://localhost:8000`
- **Prefix**: `/api`
- **Format**: JSON
- **CORS**: Enabled for `http://localhost:5173` and `http://localhost:3000`

---

## 🏗 Operations & Clinical Modules

### 1. Command Center (Analytics)
- **Health Score**: `GET /api/analytics/health-score`
  - Returns a global hospital health score (0-100) and multi-factor breakdown.
- **KPIs**: `GET /api/analytics/kpis`
  - Summary stats for beds, ER, staff, and labs.
- **Ward Workload**: `GET /api/analytics/ward-workload`
  - Detailed occupancy and patient-nurse ratios per ward.

### 2. EMR / Patient Directory (Beds)
- **All Patients**: `GET /api/beds/all`
  - List of all beds with patient names, admission dates, and floor details.
- **Bed Summary**: `GET /api/beds/summary`
  - Aggregated occupancy data by ward.
- **Update Status**: `PUT /api/beds/{bed_id}/status?status=occupied`
  - Manually toggle bed availability.

### 3. ER Console (Emergency)
- **Live Status**: `GET /api/er/status`
  - Real-time queue length, avg wait time, and critical triage counts.
- **Patient List**: `GET /api/er/patients`
  - Triage-sorted queue with vital signs (BP, Pulse, SpO2).
- **Wait Trend**: `GET /api/er/wait-trend`
  - 12-hour historical data for line charts.

### 4. Pharmacy Module
- **Stock Levels**: `GET /api/pharmacy/stock`
  - Inventory list with status flags (low, critical, ok).
- **Critical Stocks**: `GET /api/pharmacy/low-stock`
  - Filtered list of items needing immediate re-order.
- **Prescriptions**: `GET /api/pharmacy/prescriptions`
  - Recent RX history logs.

### 5. Lab Results
- **Pending Queue**: `GET /api/labs/pending`
  - Ongoing tests with turnaround timers and "overdue" flags.
- **Critical Results**: `GET /api/labs/critical`
  - Urgent findings requiring immediate physician notification.
- **TAT Stats**: `GET /api/labs/turnaround-stats`
  - Performance metrics across pathology departments.

### 6. Staff & OT
- **Personnel Duty**: `GET /api/staff/summary`
  - Staffing levels by role (Doctor, Nurse, etc.) and coverage percentages.
- **Surgical Schedule**: `GET /api/ot/schedule`
  - Forward-looking timeline of procedures, surgeons, and room allocations.

---

## 🧠 Intelligence Layer

### 7. Predictive Intelligence
- **ER Forecast**: `GET /api/predictions/er-wait`
  - ML-driven 4-hour wait time projections with confidence intervals.
- **Shortage Probability**: `GET /api/predictions/bed-shortage`
  - Risk probability for bed shortages in the next 2-4 hours.
- **Fall Risk**: `GET /api/predictions/fall-risk`
  - High-risk patients identified via vitals analysis.

### 8. What-If Simulator
- **Trigger Simulation**: `POST /api/chatbot/message`
  - Send hypothetical scenarios (e.g., "Simulate 20 trauma arrivals in 30 mins").
  - The AI returns operational impacts and ranked mitigation steps based on current DB state.

### 9. CV Monitor / Edge Vision
- **Alert Feed**: `GET /api/alerts/active`
  - Fetch real-time visual alerts (e.g., "Patient Fall Detected").
- **Resolve Alerts**: `PUT /api/alerts/{alert_id}/resolve`
  - Archive alerts after intervention.

### 10. Global AI Copilot (Chatbot)
- **Chat Interface**: `POST /api/chatbot/message`
  - **Payload**: `{"message": "String", "conversation_history": []}`
  - **Response**: `{"response": "...", "health_score_context": "..."}`
- **Proactive Insights**: `GET /api/chatbot/proactive-alert`
  - Returns critical insights on load: `{"has_alert": true, "message": "..."}`.

---

## 🎙 Voice & Real-Time Interaction

### 11. AI Voice Navigation
- **Intent Parsing**: `POST /api/chatbot/navigation-intent`
- **Payload**: `{"message": "take me to the er"}`
- **Response**: `{"route": "/er-console"}`
- **Implementation**: Frontend uses Web Speech API for STT, then navigates based on the returned route.

### 12. Real-Time WebSocket (Gemini 2.0 Flash)
- **URL**: `ws://localhost:8000/api/chatbot/ws-realtime`
- **Protocol**: JSON-based
  - **Send**: `{"type": "chat", "message": "..."}` or `{"type": "navigation", "message": "..."}`
  - **Receive**: Streamed chunks `{"type": "chat_chunk", "text": "...", "is_final": bool}` or `{"type": "navigation", "route": "..."}`
- **Benefit**: Extreme low-latency (<500ms) interaction.

### 13. Professional Voice Agent (LiveKit)
- **Standard**: WebRTC + Gemini Realtime Model.
- **Integration**: Use `@livekit/components-react`.
- **Backend Service**: `voice_agent.py` (deployed to LiveKit Cloud).
- **Subdomain**: `medical-bot-hyaq86ea`

---

## 🛠 Integration Guidelines
1. **Refresh Rates**: 
   - Dashboard KPIs: 30s
   - ER/Patient List: 10s
   - Critical Alerts: 5s polling or WebSocket trigger.
2. **State Management**: The AI is "context-aware" of the database. You do NOT need to send local JSON state to the chatbot; it queries the data directly.
3. **Icons**: Standardized on Lucide React.
4. **Theme**: Futuristic dark-clinical aesthetic (Slate/Blue/Emerald palette).
