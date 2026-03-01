# AOAI — Adaptive Operational AI for Healthcare

AOAI is a next-generation "intelligence layer" that sits above hospital operational data. It transforms a standard hospital from a reactive environment into a proactive one by predicting crises before they occur and providing a real-time AI assistant for administrators.

## 🚀 Key Features

- **Command Center Dashboard**: Real-time Hospital Health Score, KPI tracking, and live alert feeds.
- **Predictive Intelligence**: 
  - **ER Wait Forecast**: XGBoost-powered 4-hour lookahead for ER congestion.
  - **Bed Shortage Risk**: LSTM-inspired modeling of ward occupancy trends.
  - **Fall Risk**: Real-time identification of at-risk patients via vital monitoring.
- **Gemini-Powered Admin Assistant**: An AI chatbot with a **live snapshot** of the entire hospital database. It provides ranked action lists and proactive operational alerts.
- **What-If Simulator**: Model operational decisions (adding staff, diverting ambulances) to see their predicted impact on health scores and wait times.
- **Computer Vision Monitor**: In-browser pose detection (MediaPipe) that alerts staff to falls, motionless patients, or help requests with zero video data leaving the device.

## 🛠 Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy, SQLite.
- **AI**: Google Gemini Pro (`gemini-2.0-flash`).
- **Machine Learning**: Scikit-Learn (Gradient Boosting), XGBoost, Pandas.
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion.
- **CV**: MediaPipe (Edge Processing).

## 📥 Installation & Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```
**Environment Variables**: Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key
```

**Seed Database**: Generate 6 months of synthetic hospital data:
```bash
python seed_data.py
```

**Run Server**:
```bash
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📂 Project Structure

- `backend/`: FastAPI application, database models, and ML training scripts.
  - `routers/`: 10 distinct API modules (ER, Beds, Pharmacy, etc.).
  - `ml/`: Model training and prediction logic.
- `frontend/`: React application using Vite.
  - `src/components/`: Reusable UI widgets and layout modules.
  - `src/pages/`: Main views (Dashboard, Vision, Simulator, etc.).

## 🔒 Security & HIPAA
AOAI is designed with a "Privacy First" architecture. Computer vision processing happens entirely in the browser (client-side), meaning no patient video or imagery is ever transmitted to a server or stored in a database.

---
*Built for the Future of Clinical Operations.*
