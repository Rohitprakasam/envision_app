from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Bed, ERPatient, PharmacyItem, Alert, Staff, LabTest
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/health-score")
def get_health_score(db: Session = Depends(get_db)):
    # Bed score
    total_beds = db.query(Bed).count()
    occupied = db.query(Bed).filter(Bed.status == "occupied").count()
    occupancy_rate = occupied / total_beds if total_beds > 0 else 0
    bed_score = max(0, 100 - (occupancy_rate * 100))

    # ER score
    avg_wait = db.query(func.avg(ERPatient.wait_minutes)).filter(
        ERPatient.status == "waiting").scalar() or 0
    er_score = max(0, 100 - (avg_wait * 0.8))

    # Pharmacy score
    low_stock = db.query(PharmacyItem).filter(
        PharmacyItem.stock_quantity < PharmacyItem.minimum_threshold).count()
    pharmacy_score = max(0, 100 - (low_stock * 12))

    # Alert score
    critical_alerts = db.query(Alert).filter(
        Alert.alert_type == "critical", Alert.is_resolved == False).count()
    alert_score = max(0, 100 - (critical_alerts * 15))

    # Staff score
    total_staff = db.query(Staff).filter(Staff.scheduled == True).count()
    on_duty = db.query(Staff).filter(Staff.status == "on_duty").count()
    staff_score = (on_duty / total_staff * 100) if total_staff > 0 else 100

    # Lab score
    overdue_labs = db.query(LabTest).filter(
        LabTest.status.in_(["ordered", "processing"]),
        LabTest.ordered_at < datetime.utcnow() - timedelta(hours=2)
    ).count()
    lab_score = max(0, 100 - (overdue_labs * 8))

    final_score = round(
        bed_score * 0.25 + er_score * 0.25 + pharmacy_score * 0.15 +
        alert_score * 0.20 + staff_score * 0.10 + lab_score * 0.05
    )

    return {
        "score": final_score,
        "status": "good" if final_score >= 80 else "warning" if final_score >= 60 else "critical",
        "trend": "stable",
        "breakdown": {
            "beds": {"score": round(bed_score), "occupancy_rate": round(occupancy_rate * 100)},
            "er": {"score": round(er_score), "avg_wait": round(avg_wait)},
            "pharmacy": {"score": round(pharmacy_score), "low_stock_count": low_stock},
            "alerts": {"score": round(alert_score), "critical_count": critical_alerts},
            "staff": {"score": round(staff_score), "on_duty": on_duty, "total": total_staff},
            "labs": {"score": round(lab_score), "overdue": overdue_labs}
        },
        "computed_at": datetime.utcnow().isoformat()
    }

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_beds = db.query(Bed).count()
    occupied_beds = db.query(Bed).filter(Bed.status == "occupied").count()
    er_queue = db.query(ERPatient).filter(ERPatient.status == "waiting").count()
    avg_wait = db.query(func.avg(ERPatient.wait_minutes)).filter(
        ERPatient.status == "waiting").scalar() or 0
    critical_alerts = db.query(Alert).filter(
        Alert.alert_type == "critical", Alert.is_resolved == False).count()
    total_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    on_duty = db.query(Staff).filter(Staff.status == "on_duty").count()
    total_staff = db.query(Staff).filter(Staff.scheduled == True).count()
    low_stock = db.query(PharmacyItem).filter(
        PharmacyItem.stock_quantity < PharmacyItem.minimum_threshold).count()
    pending_labs = db.query(LabTest).filter(
        LabTest.status.in_(["ordered", "processing"]),
        LabTest.ordered_at < datetime.utcnow() - timedelta(hours=2)
    ).count()

    return {
        "active_patients": occupied_beds,
        "bed_occupancy": {"occupied": occupied_beds, "total": total_beds,
                          "percentage": round(occupied_beds / total_beds * 100) if total_beds else 0},
        "er_status": {"queue": er_queue, "avg_wait_minutes": round(avg_wait)},
        "alerts": {"critical": critical_alerts, "total": total_alerts},
        "staff": {"on_duty": on_duty, "scheduled": total_staff,
                  "coverage_pct": round(on_duty / total_staff * 100) if total_staff else 0},
        "pharmacy_low_stock": low_stock,
        "pending_labs_overdue": pending_labs
    }

@router.get("/patient-flow")
def patient_flow(db: Session = Depends(get_db)):
    """Returns 30-day admission vs discharge trend (simulated from current data)"""
    import random
    from datetime import date
    data = []
    base_admits = 18
    for i in range(30):
        day = date.today() - timedelta(days=29 - i)
        admits = base_admits + random.randint(-5, 8)
        discharges = admits - random.randint(-3, 5)
        data.append({
            "date": day.strftime("%b %d"),
            "admissions": admits,
            "discharges": max(0, discharges)
        })
    return data

@router.get("/ward-workload")
def ward_workload(db: Session = Depends(get_db)):
    wards = ["ICU", "General", "Pediatrics", "Emergency", "Maternity", "Surgical"]
    result = []
    for ward in wards:
        total = db.query(Bed).filter(Bed.ward == ward).count()
        occupied = db.query(Bed).filter(Bed.ward == ward, Bed.status == "occupied").count()
        nurses = db.query(Staff).filter(
            Staff.department == ward, Staff.role == "nurse", Staff.status == "on_duty").count()
        result.append({
            "ward": ward, "total_beds": total, "occupied": occupied,
            "available": total - occupied,
            "occupancy_pct": round(occupied / total * 100) if total else 0,
            "nurses_on_duty": nurses,
            "patient_nurse_ratio": round(occupied / nurses, 1) if nurses > 0 else 0
        })
    return result
