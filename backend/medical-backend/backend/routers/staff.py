from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Staff

router = APIRouter()

@router.get("/summary")
def staff_summary(db: Session = Depends(get_db)):
    all_staff = db.query(Staff).all()
    return {
        "total_scheduled": sum(1 for s in all_staff if s.scheduled),
        "on_duty": sum(1 for s in all_staff if s.status == "on_duty"),
        "off_duty": sum(1 for s in all_staff if s.status == "off_duty"),
        "on_leave": sum(1 for s in all_staff if s.status == "on_leave"),
        "by_role": {
            role: {"total": sum(1 for s in all_staff if s.role == role),
                   "on_duty": sum(1 for s in all_staff if s.role == role and s.status == "on_duty")}
            for role in ["doctor", "nurse", "technician", "admin"]
        }
    }
