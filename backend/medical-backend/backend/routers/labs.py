from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LabTest
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/pending")
def pending_tests(db: Session = Depends(get_db)):
    tests = db.query(LabTest).filter(
        LabTest.status.in_(["ordered", "sample_collected", "processing"])
    ).order_by(LabTest.ordered_at).all()
    return [{
        "id": t.id, "patient_name": t.patient_name, "test_name": t.test_name,
        "category": t.category, "ordered_by": t.ordered_by,
        "status": t.status, "ordered_at": str(t.ordered_at),
        "wait_hours": round((datetime.utcnow() - t.ordered_at).total_seconds() / 3600, 1),
        "is_overdue": t.ordered_at < datetime.utcnow() - timedelta(hours=2)
    } for t in tests]

@router.get("/critical")
def critical_results(db: Session = Depends(get_db)):
    tests = db.query(LabTest).filter(LabTest.is_critical == True).all()
    return [{"patient_name": t.patient_name, "test_name": t.test_name,
             "result_value": t.result_value, "ordered_by": t.ordered_by,
             "completed_at": str(t.completed_at)} for t in tests]

@router.get("/turnaround-stats")
def turnaround_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    avg_tat = db.query(func.avg(LabTest.turnaround_minutes)).filter(
        LabTest.turnaround_minutes != None).scalar() or 0
    categories = ["hematology", "biochemistry", "microbiology", "serology"]
    by_category = []
    for cat in categories:
        avg = db.query(func.avg(LabTest.turnaround_minutes)).filter(
            LabTest.category == cat, LabTest.turnaround_minutes != None).scalar() or 0
        by_category.append({"category": cat, "avg_minutes": round(avg)})
    return {"overall_avg_minutes": round(avg_tat), "by_category": by_category}
