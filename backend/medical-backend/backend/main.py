from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import beds, er, pharmacy, labs, staff, alerts, analytics, chatbot, predictions, ot

Base.metadata.create_all(bind=engine)

# Train ML models on startup
try:
    from ml.er_predictor import train_model
    train_model()
    print("✅ ML models trained")
except Exception as e:
    print(f"⚠️ ML training skipped: {e}")

app = FastAPI(title="AOAI Hospital Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(beds.router, prefix="/api/beds", tags=["Beds"])
app.include_router(er.router, prefix="/api/er", tags=["Emergency"])
app.include_router(pharmacy.router, prefix="/api/pharmacy", tags=["Pharmacy"])
app.include_router(labs.router, prefix="/api/labs", tags=["Labs"])
app.include_router(staff.router, prefix="/api/staff", tags=["Staff"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(ot.router, prefix="/api/ot", tags=["OT"])

@app.get("/")
def root():
    return {"status": "AOAI API running", "version": "1.0.0"}
