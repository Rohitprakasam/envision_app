import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime, timedelta
import random

MODEL_PATH = "ml/er_model.pkl"
SCALER_PATH = "ml/er_scaler.pkl"

def generate_training_data():
    """Generate 6 months of synthetic hourly ER wait time data"""
    records = []
    start = datetime.now() - timedelta(days=180)
    
    for day in range(180):
        for hour in range(24):
            dt = start + timedelta(days=day, hours=hour)
            
            # Base wait by hour (peaks at morning/evening rush)
            hour_factor = 1.0
            if 8 <= hour <= 10: hour_factor = 1.5
            elif 17 <= hour <= 20: hour_factor = 1.8
            elif 0 <= hour <= 5: hour_factor = 0.5
            
            # Day of week factor (weekends higher)
            dow = dt.weekday()
            dow_factor = 1.3 if dow >= 5 else 1.0
            if dow == 1 and 14 <= hour <= 18: dow_factor = 1.6  # Tuesday pm spike
            
            # Season factor
            month = dt.month
            season = 1.2 if month in [12, 1, 2] else 1.0  # Winter surge
            
            base_wait = 25
            wait = base_wait * hour_factor * dow_factor * season + random.gauss(0, 5)
            wait = max(5, min(120, wait))
            
            records.append({
                "hour": hour,
                "day_of_week": dow,
                "month": month,
                "is_weekend": 1 if dow >= 5 else 0,
                "wait_minutes": round(wait, 1)
            })
    
    return pd.DataFrame(records)

def train_model():
    """Train and save the ER wait time predictor"""
    df = generate_training_data()
    
    features = ["hour", "day_of_week", "month", "is_weekend"]
    X = df[features].values
    y = df["wait_minutes"].values
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X_scaled, y)
    
    os.makedirs("ml", exist_ok=True)
    with open(MODEL_PATH, "wb") as f: pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f: pickle.dump(scaler, f)
    
    score = model.score(X_scaled, y)
    print(f"ER Predictor trained. R² score: {score:.3f}")
    return model, scaler

def load_or_train():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        with open(MODEL_PATH, "rb") as f: model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f: scaler = pickle.load(f)
        return model, scaler
    return train_model()

def predict_next_hours(n_hours=4):
    """Predict ER wait time for next n_hours"""
    model, scaler = load_or_train()
    
    predictions = []
    now = datetime.utcnow()
    
    for i in range(1, n_hours + 1):
        future = now + timedelta(hours=i)
        features = np.array([[
            future.hour,
            future.weekday(),
            future.month,
            1 if future.weekday() >= 5 else 0
        ]])
        
        X_scaled = scaler.transform(features)
        pred_wait = model.predict(X_scaled)[0]
        
        # Confidence decreases with horizon
        confidence = round(0.91 - (i * 0.04), 2)
        
        predictions.append({
            "hour": future.strftime("%H:00"),
            "predicted_wait": round(max(10, pred_wait), 1),
            "confidence": confidence,
            "horizon_hours": i
        })
    
    return predictions

if __name__ == "__main__":
    train_model()
    print("Predictions:", predict_next_hours(4))
