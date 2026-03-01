# AOAI — Hospital Operations Intelligence Platform

## 📦 Project Overview
AOAI is an advanced AI intelligence layer designed to sit on top of modern hospital operations. It provides clinical administrators with real-time visibility, predictive foresight, and multimodal AI assistance to optimize patient flow, staffing, and resource allocation.

---

## 🏗 System Architecture

### Backend (FastAPI + SQLAlchemy)
- **Core Engine**: Python 3.10+ powered by FastAPI for high-performance async requests.
- **Database**: SQLite (local dev) with a robust clinical schema (Beds, ER, Pharmacy, Labs, Staff, OT, Alerts).
- **ML Engine**: Custom XGBoost models for predicting ER wait times and bed shortages.
- **API Model**: Modular router architecture with 10 distinct operational domains.

### AI Intelligence (Google Gemini 2.0 Flash)
- **Logic**: Native integration with Gemini 2.0 Flash for sub-second analysis.
- **Context Awareness**: On every request, the AI is injected with a live "Hospital Snapshot" (Occupancy, Critical Triage, Low Stocks, Active Alerts) ensuring no "hallucinations" about current state.

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for lightning-fast HMR.
- **Styling**: "Inky Ocean" Dark Mode aesthetic using Vanilla CSS for a premium, non-generic look.
- **Visuals**: Recharts for analytics and Framer Motion for dynamic UI transitions.

---

## 🏥 10 Clinical Modules

1. **Integrated Command Center**: Real-time Health Score (0-100) and global hospital KPIs.
2. **EMR & Patient Directory**: Full bed management with admission/discharge tracking.
3. **ER Console**: High-fidelity triage queue with live vital sign monitoring (BP, SpO2, Pulse).
4. **Pharmacy Inventory**: Smart tracking with automated low-stock and critical-shortage alerts.
5. **Laboratory Information System**: Centralized test queue with TAT (Turnaround Time) metrics.
6. **Personnel & Staffing**: Real-time duty logs and department coverage analysis.
7. **Operation Theatre (OT)**: Surgical schedule management and room allocation timeline.
8. **Predictive Intelligence**: ML-driven 4-hour forecasts for ER and Ward pressure.
9. **What-If Simulator**: Scenario planning interface to test operational changes (e.g., adding staff).
10. **CV Edge Monitor**: Privacy-preserving pose detection for falls or missing patients.

---

## 🎙 Voice & Interaction Layer

### 1. AI Voice Navigation
- **Intent-Based Routing**: Users can navigate the entire app hands-free (e.g., "Show me the ER triage").
- **Backend Logic**: Gemini parses natural speech and returns valid frontend routes.

### 2. Multi-Modal Live Beta (WebSocket)
- **Bidirectional Stream**: Real-time voice and text interaction via a unified WebSocket gateway.
- **Sub-500ms Latency**: Built on the latest Gemini 2.0 Flash Real-Time Model.

### 3. Professional Voice Agent (LiveKit)
- **WebRTC Implementation**: Uses LiveKit to handle complex audio environments (VAD, Echo Cancellation).
- **Service**: Standalone `voice_agent.py` service bridging speech-to-speech interaction natively.

---

## 📂 Key Project Artifacts

- **[front_plan.md](file:///c:/Users/acer/OneDrive/Desktop/first_project/aoai/front_plan.md)**: Unified integration specs for the frontend team.
- **[walkthrough.md](file:///C:/Users/acer/.gemini/antigravity/brain/8f83d913-43f7-4853-b882-11fc928e071e/walkthrough.md)**: Historical record of the build phases and migrations.
- **[requirements.txt](file:///c:/Users/acer/OneDrive/Desktop/first_project/aoai/backend/requirements.txt)**: Python dependencies including `google-generativeai`, `livekit-agents`, and `pandas`.

---

## 🚀 Deployment Status
- **Backend/Frontend**: Locally verified and operational.
- **LiveKit Cloud**: Infrastructure ready, pending project-level agent quota cleanup in the LiveKit Dashboard.

---
*Created by AOAI Engineering Team — March 2026*
