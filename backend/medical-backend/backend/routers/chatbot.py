from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Bed, ERPatient, PharmacyItem, Alert, Staff, LabTest, Surgery
from sqlalchemy import func
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are AOAI — the AI intelligence layer of a hospital operations platform. You assist hospital administrators with real-time operational decisions.

Your personality:
- Direct, clinical, action-oriented
- You speak in brief, precise sentences
- You always give ranked action lists when asked what to prioritize
- You flag risks proactively
- You never give generic advice — always reference the actual data provided

Response format rules:
- Keep responses under 200 words unless generating a full report
- For "what should I do" questions: always give exactly 3 ranked actions with impact estimate
- For analysis questions: lead with the key insight, then supporting data
- For summaries: use a structured format with sections
- Never say "I don't have access to" — you always have the live snapshot

You have access to a live hospital data snapshot that is injected at the start of every conversation. Use this data to give specific, actionable answers."""

def get_gemini_model(context: str = ""):
    sys_prompt = f"{SYSTEM_PROMPT}\n\n{context}" if context else SYSTEM_PROMPT
    return genai.GenerativeModel("gemini-2.0-flash", system_instruction=sys_prompt)

class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []

def build_hospital_context(db: Session) -> str:
    """Builds a real-time hospital snapshot to inject as AI context"""
    
    # Beds
    total_beds = db.query(Bed).count()
    occupied_beds = db.query(Bed).filter(Bed.status == "occupied").count()
    occupancy_pct = round(occupied_beds / total_beds * 100) if total_beds else 0

    # ER
    er_waiting = db.query(ERPatient).filter(ERPatient.status == "waiting").count()
    er_critical = db.query(ERPatient).filter(
        ERPatient.status == "waiting", ERPatient.triage_level == 1).count()
    avg_wait = db.query(func.avg(ERPatient.wait_minutes)).filter(
        ERPatient.status == "waiting").scalar() or 0

    # Pharmacy
    low_stock_items = db.query(PharmacyItem).filter(
        PharmacyItem.stock_quantity < PharmacyItem.minimum_threshold).all()
    low_stock_names = [i.drug_name for i in low_stock_items[:5]]

    # Alerts
    critical_alerts = db.query(Alert).filter(
        Alert.alert_type == "critical", Alert.is_resolved == False).all()
    alert_messages = [a.message for a in critical_alerts[:5]]

    # Staff
    on_duty = db.query(Staff).filter(Staff.status == "on_duty").count()
    scheduled = db.query(Staff).filter(Staff.scheduled == True).count()
    coverage = round(on_duty / scheduled * 100) if scheduled else 0

    # Labs
    overdue_labs = db.query(LabTest).filter(
        LabTest.status.in_(["ordered", "processing"]),
        LabTest.ordered_at < datetime.utcnow() - timedelta(hours=2)
    ).count()

    # Surgeries today
    todays_surgeries = db.query(Surgery).filter(
        Surgery.scheduled_at >= datetime.utcnow(),
        Surgery.scheduled_at <= datetime.utcnow() + timedelta(hours=12),
        Surgery.status == "scheduled"
    ).count()

    # Compute health score
    bed_score = max(0, 100 - occupancy_pct)
    er_score = max(0, 100 - avg_wait * 0.8)
    alert_score = max(0, 100 - len(critical_alerts) * 15)
    health_score = round((bed_score * 0.35 + er_score * 0.35 + alert_score * 0.3))

    context = f"""
=== AOAI LIVE HOSPITAL SNAPSHOT — {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")} ===

HOSPITAL HEALTH SCORE: {health_score}/100 ({'GOOD' if health_score >= 80 else 'WARNING' if health_score >= 60 else 'CRITICAL'})

BED STATUS:
- Total beds: {total_beds} | Occupied: {occupied_beds} ({occupancy_pct}%) | Available: {total_beds - occupied_beds}
- Ward breakdown: Derived from live database

EMERGENCY ROOM:
- Patients waiting: {er_waiting} | In treatment: (see ER module)
- Critical (Triage 1): {er_critical} patients
- Average wait time: {round(avg_wait)} minutes

PHARMACY:
- Low stock items: {len(low_stock_items)}
- Items below threshold: {', '.join(low_stock_names) if low_stock_names else 'None'}

ACTIVE CRITICAL ALERTS ({len(critical_alerts)} total):
{chr(10).join(f'- {m}' for m in alert_messages) if alert_messages else '- None'}

STAFF:
- On duty: {on_duty}/{scheduled} scheduled ({coverage}% coverage)

LABORATORY:
- Overdue tests (>2hr): {overdue_labs}

OPERATION THEATRE:
- Surgeries scheduled next 12 hours: {todays_surgeries}

=== END SNAPSHOT ===
"""
    return context



@router.post("/message")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    context = build_hospital_context(db)
    
    # Build message history
    messages = []
    
    # Add conversation history (last 8 messages for context window)
    for msg in request.conversation_history[-8:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current message
    messages.append({"role": "user", "content": request.message})
    
    try:
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        model = get_gemini_model(context)
        response = model.generate_content(
            contents=contents,
            generation_config=genai.types.GenerationConfig(max_output_tokens=1000)
        )
        
        return {
            "response": response.text,
            "health_score_context": context.split("HOSPITAL HEALTH SCORE: ")[1].split("\n")[0] if "HOSPITAL HEALTH SCORE:" in context else "N/A",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.get("/proactive-alert")
async def proactive_alert(db: Session = Depends(get_db)):
    """Called by frontend on load — returns a proactive insight if warranted"""
    context = build_hospital_context(db)
    
    try:
        model = get_gemini_model(context)
        response = model.generate_content(
            contents="Based on the current hospital data, is there anything I should be immediately aware of? If yes, give me one critical insight in 2 sentences max. If everything is normal, respond with exactly: 'ALL_CLEAR'",
            generation_config=genai.types.GenerationConfig(max_output_tokens=200)
        )
        
        text = response.text.strip()
        if text == "ALL_CLEAR":
            return {"has_alert": False}
        
        return {
            "has_alert": True,
            "message": text,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {"has_alert": False}

@router.post("/navigation-intent")
async def get_navigation_intent(request: ChatRequest):
    """Parses user voice command to find the correct frontend route"""
    nav_prompt = """You are a navigation controller for a hospital operations platform. 
    Analyze the user's voice command and return EXACTLY ONE of these routes: 
    - /dashboard
    - /patients
    - /er-console
    - /pharmacy
    - /labs
    - /staff
    - /predictions
    - /simulator
    - /vision
    - /alerts

    Rules:
    - Return ONLY the route string (e.g., "/dashboard")
    - If unsure, return "/dashboard"
    - "EMR", "Beds", "Directory" -> /patients
    - "Emergency", "ER", "Triage" -> /er-console
    - "Medicine", "Stock", "Inventory" -> /pharmacy
    - "Pathology", "Tests", "Results" -> /labs
    - "OT", "Surgery", "Doctors", "Nurses" -> /staff
    - "Forecast", "Intelligence", "Risk" -> /predictions
    - "What-if", "Scenario", "Simulation" -> /simulator
    - "Camera", "Monitor", "CCTV", "detection" -> /vision
    - "Notifications", "Critical" -> /alerts
    """
    
    try:
        model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=nav_prompt)
        response = model.generate_content(request.message)
        route = response.text.strip().lower()
        
        # Validation to ensure it's a valid route
        valid_routes = ["/dashboard", "/patients", "/er-console", "/pharmacy", "/labs", "/staff", "/predictions", "/simulator", "/vision", "/alerts"]
        if route not in valid_routes:
            route = "/dashboard"
            
        return {"route": route}
    except Exception as e:
        return {"route": "/dashboard"}
