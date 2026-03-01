# AOAI Machine Learning Models Guide

This document outlines the machine learning and AI models used (or planned for finetuning) in the AOAI platform.

## 1. ER Wait Time Predictor (Active)
- **Current Implementation**: Gradient Boosting Regressor (Scikit-Learn).
- **Location**: `backend/ml/er_predictor.py`
- **Purpose**: Predicts the expected ER wait time (in minutes) for the next 1-4 hours.
- **Features Used**: Day of week, hour of day, current patients waiting, active ER beds, available doctors, available nurses, incoming ambulances.
- **Finetuning Goals**: Replace with a more advanced XGBoost or LightGBM model trained on real hospital historical data to capture complex temporal patterns and local surges.

## 2. Bed Shortage Predictor (Planned for ML Team)
- **Current Implementation**: Heuristic/mocked in `backend/routers/predictions.py`.
- **Target Model**: Time-series forecasting (e.g., LSTM, Prophet, or temporal CNN).
- **Purpose**: Predicts the probability of a ward running out of available beds within the next 24-48 hours.
- **Target Features**: Current occupancy, incoming ER admits, historical discharge rates by day, scheduled surgeries.

## 3. Patient Fall Risk Classifier (Planned for ML Team)
- **Current Implementation**: Heuristic/mocked correlation based on age and recent vitals.
- **Target Model**: Binary Classification (e.g., Random Forest, XGBoost Classifier, or Logistic Regression).
- **Purpose**: Identify inpatients at high risk of falling so preventative measures can be taken.
- **Target Features**: Patient age, recent medications (sedatives/narcotics), mobility status, history of falls, current vitals (blood pressure drops).

## 4. 30-Day Readmission Risk (Planned for ML Team)
- **Current Implementation**: Heuristic/mocked based on diagnosis severity.
- **Target Model**: Deep Neural Network or Gradient Boosted Classification.
- **Purpose**: Flag patients who are highly likely to return to the hospital within 30 days of discharge, triggering enhanced follow-up care.
- **Target Features**: Primary diagnosis code, length of stay, number of previous admissions, comorbidities, age, discharge destination.

## 5. Generative AI Chatbot & Simulator (Active)
- **Current Implementation**: Google Gemini API (`gemini-2.0-flash`).
- **Location**: `backend/routers/chatbot.py`
- **Purpose**: 
  1. Live conversational UI for hospital administrators to query real-time database state (RAG).
  2. "What-If" simulation engine to estimate the impact of operational decisions (e.g., "What happens if we divert ambulances for 2 hours?").
- **Finetuning Goals**: While using the base Gemini model with strong prompting currently works, a finetuned healthcare specific LLM (like Med-PaLM) or a strictly finetuned Gemini instance could improve the rigidity of JSON outputs and medical terminology understanding.

## 6. Computer Vision Edge Monitoring (Active)
- **Current Implementation**: MediaPipe Pose Landmarker (Client-side / Browser).
- **Location**: `frontend/src/pages/Vision.jsx`
- **Purpose**: Real-time detection of patient distress (falls, waving for help, lack of motion) without transmitting video data off-device.
- **Finetuning Goals**: Train custom task-specific YOLO or MobileNet models for highly specific ward environments (e.g., recognizing specialized medical equipment state or specific distress postures) to replace the generic pose tracking.
