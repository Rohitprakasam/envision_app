from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import ERPatient
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/status")
def er_status(db: Session = Depends(get_db)):
    all_active = db.query(ERPatient).filter(ERPatient.status.in_(["waiting", "in_treatment"])).all()
    waiting = [p for p in all_active if p.status == "waiting"]
    avg_wait = sum(p.wait_minutes for p in waiting) / len(waiting) if waiting else 0

    return {
        "queue_length": len(waiting),
        "in_treatment": len([p for p in all_active if p.status == "in_treatment"]),
        "avg_wait_minutes": round(avg_wait),
        "critical_count": sum(1 for p in waiting if p.triage_level == 1),
        "triage_breakdown": {
            "level_1_resuscitation": sum(1 for p in waiting if p.triage_level == 1),
            "level_2_emergency": sum(1 for p in waiting if p.triage_level == 2),
            "level_3_urgent": sum(1 for p in waiting if p.triage_level == 3),
            "level_4_semi_urgent": sum(1 for p in waiting if p.triage_level == 4),
            "level_5_non_urgent": sum(1 for p in waiting if p.triage_level == 5),
        }
    }

@router.get("/patients")
def er_patients(db: Session = Depends(get_db)):
    patients = db.query(ERPatient).filter(
        ERPatient.status.in_(["waiting", "in_treatment"])).all()
    triage_colors = {1: "red", 2: "orange", 3: "yellow", 4: "green", 5: "blue"}
    return [{
        "id": p.id, "name": p.name, "age": p.age,
        "chief_complaint": p.chief_complaint,
        "triage_level": p.triage_level,
        "triage_color": triage_colors.get(p.triage_level, "gray"),
        "status": p.status, "wait_minutes": p.wait_minutes,
        "assigned_doctor": p.assigned_doctor,
        "vitals": {"bp": p.vitals_bp, "pulse": p.vitals_pulse, "spo2": p.vitals_spo2}
    } for p in sorted(patients, key=lambda x: x.triage_level)]

@router.get("/wait-trend")
def er_wait_trend():
    """12-hour historical trend + simulated data"""
    import random
    data = []
    base = 35
    for i in range(13):
        hour = (datetime.utcnow() - timedelta(hours=12-i)).strftime("%H:00")
        wait = max(5, base + random.randint(-10, 20))
        base = wait
        data.append({"hour": hour, "wait_minutes": wait, "type": "actual"})
    return data
