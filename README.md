# AURA-H — Hospital Intelligence Platform

<div align="center">

![AURA-H Banner](https://img.shields.io/badge/AURA--H-Hospital%20Intelligence-e35d3d?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Real-Time AI Command Center for Modern Hospital Operations**

[Live Demo](#) · [Report a Bug](issues) · [Request Feature](issues)

</div>

---

## 🏥 Overview

**AURA-H** (Advanced Unified Real-time Analytics for Hospitals) is an AI-powered, real-time hospital operations platform. It provides hospital administrators, clinicians, and staff with a unified command centre that combines live telemetry, predictive ML analytics, a Gemini-powered AI copilot, computer vision patient monitoring, and a scenario simulation engine.

> "Every hospital deserves intelligence — from 50-bed rural clinics to 2,000-bed metropolitan hospitals."

---

## ✨ Features

| Module                           | Description                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| 🏠 **Hospital Command Center**   | Real-time KPIs: bed capacity, ER throughput, staffing sync, proactive AI alerts |
| 🚨 **ER Console**                | Live triage queue with vitals, priority badges, wait time telemetry             |
| 💊 **Pharmacy Logistics**        | Drug stock levels, critical depletion alerts, expiry tracking                   |
| 🔬 **Lab Results & Diagnostics** | Pending queue with overdue flags, turnaround-time analytics                     |
| 👥 **Staff & OT Scheduling**     | Coverage telemetry per role + surgical theatre operational log                  |
| 📈 **AI Predictions Engine**     | ML ER surge forecasting, bed shortage risk, readmission probability             |
| 🧪 **Scenario Simulator**        | Natural language "What-If" stress-testing via Gemini AI                         |
| 🤖 **Intelligence Copilot**      | LLM chatbot with voice (STT/TTS) and full hospital context awareness            |
| 👁️ **CV Visual Monitor**         | Computer Vision camera analysis for patient safety events                       |
| 📋 **EMR Directory**             | Aggregated patient record manifest with sector-level analytics                  |

---

## 🧠 Tech Stack

### Frontend

```
React 18 + Vite + TypeScript
Tailwind CSS + Framer Motion
Recharts (data visualization)
Web Speech API (Voice STT/TTS)
TanStack Query (server state)
```

### Backend

```
FastAPI (Python 3.11+)
SQLAlchemy ORM + SQLite / PostgreSQL
Uvicorn ASGI server
Google Gemini API (LLM)
scikit-learn + pandas (ML predictions)
```

### AI/ML

```
Google Gemini 1.5 Flash (Copilot + Simulator)
ML Prediction Engine (ER surge, bed shortage, readmission)
OpenCV / YOLO (Computer Vision layer)
Web Speech API (browser-native voice)
```

---

## 📁 Project Structure

```
medical-hackathon/
├── backend/
│   └── medical-backend/
│       └── backend/
│           ├── main.py              # FastAPI entry point
│           ├── models.py            # SQLAlchemy models
│           ├── database.py          # DB connection
│           ├── seed_data.py         # Realistic test data seeder
│           ├── requirements.txt     # Python dependencies
│           ├── .env.example         # Environment template ✅
│           ├── routers/             # API route modules
│           │   ├── analytics.py
│           │   ├── alerts.py
│           │   ├── chatbot.py
│           │   ├── er.py
│           │   ├── pharmacy.py
│           │   ├── labs.py
│           │   ├── staff.py
│           │   ├── emr.py
│           │   └── predictions.py
│           └── ml/                  # ML prediction models
│               ├── predictor.py
│               └── ...
└── frontend/
    └── aura-care-connect/
        ├── src/
        │   ├── pages/              # All dashboard pages
        │   ├── components/         # Reusable UI components
        │   ├── hooks/              # React Query data hooks
        │   ├── lib/                # API client utilities
        │   └── index.css           # Hospital White design system
        ├── public/
        ├── package.json
        └── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (or Bun)
- A free [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/aura-h-hospital-platform.git
cd aura-h-hospital-platform
```

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend/medical-backend/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env       # Windows
cp .env.example .env         # Linux/macOS

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_key_here

# Seed the database with realistic hospital data
python seed_data.py

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> Backend runs at: **http://localhost:8000**
> API Docs (Swagger): **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
# Open a new terminal, navigate to frontend
cd frontend/aura-care-connect

# Install dependencies
npm install

# Start dev server
npm run dev
```

> Frontend runs at: **http://localhost:5173**

---

## 🌐 API Endpoints (Summary)

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| GET    | `/api/analytics/kpis`               | Hospital KPIs (beds, ER, staffing) |
| GET    | `/api/analytics/health-score`       | Overall health score index         |
| GET    | `/api/analytics/ward-workload`      | Per-ward patient load              |
| GET    | `/api/alerts/active`                | Active system alerts               |
| POST   | `/api/alerts/{id}/resolve`          | Resolve an alert                   |
| GET    | `/api/er/status`                    | ER queue + wait stats              |
| GET    | `/api/er/patients`                  | ER patient triage list             |
| GET    | `/api/er/wait-trend`                | ER wait time chart data            |
| GET    | `/api/pharmacy/stock`               | Pharmacy inventory + alerts        |
| GET    | `/api/labs/pending`                 | Pending lab orders                 |
| GET    | `/api/labs/turnaround-stats`        | TAT analytics                      |
| GET    | `/api/staff/summary`                | Staffing by role                   |
| GET    | `/api/staff/ot-schedule`            | OT surgical schedule               |
| GET    | `/api/emr/patients`                 | EMR patient directory              |
| POST   | `/api/chatbot/message`              | AI Copilot + Simulator endpoint    |
| GET    | `/api/predictions/er-forecast`      | ML ER wait forecast                |
| GET    | `/api/predictions/bed-shortage`     | Bed shortage risk score            |
| GET    | `/api/predictions/readmission-risk` | 30-day readmission risk            |

---

## 🔑 Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/aura_h
HOST=0.0.0.0
PORT=8000
```

> ⚠️ **Never commit your `.env` file.** Use `.env.example` as a template.

---

## 🎯 SDG Alignment

This project directly contributes to United Nations Sustainable Development Goals:

- 🟢 **SDG 3** — Good Health and Well-Being: Reduces preventable harm via real-time clinical intelligence
- 🟡 **SDG 9** — Innovation and Infrastructure: AI & CV as hospital infrastructure primitives
- 🔵 **SDG 10** — Reduced Inequalities: Lightweight SaaS accessible to low-resource hospitals globally

---

## 📊 Business Model

AURA-H is structured as a **B2B SaaS + PaaS** platform:

| Tier           | Target                     | Price      |
| -------------- | -------------------------- | ---------- |
| 🆓 Free (Lite) | Small clinics, research    | $0/month   |
| 🟡 Core        | 50–200 bed hospitals       | $299/month |
| 🔵 Pro         | 200–500 beds + AI modules  | $999/month |
| 🔴 Enterprise  | Hospital chains, 500+ beds | Custom     |
| 🏛️ Government  | National health ministries | Contract   |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure no API keys or secrets are included in your PR.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Team

Built with ❤️ for [Hackathon Name] — [Date]

| Name            | Role                        |
| --------------- | --------------------------- |
| [Team Member 1] | Full Stack + AI Integration |
| [Team Member 2] | ML / Data Science           |
| [Team Member 3] | Backend / DevOps            |
| [Team Member 4] | UI/UX Design                |

---

<div align="center">

**AURA-H** — The Operating System for the Modern Hospital 🏥

_Real-Time Awareness · Predictive Intelligence · Patient Safety_

</div>
