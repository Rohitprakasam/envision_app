from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Surgery

router = APIRouter()

@router.get("/schedule")
def ot_schedule(db: Session = Depends(get_db)):
    surgeries = db.query(Surgery).order_by(Surgery.scheduled_at).all()
    return [{
        "id": s.id, "patient_name": s.patient_name,
        "procedure_name": s.procedure_name, "surgeon": s.surgeon,
        "anesthesiologist": s.anesthesiologist, "ot_room": s.ot_room,
        "scheduled_at": str(s.scheduled_at), "status": s.status,
        "duration_minutes": s.duration_minutes
    } for s in surgeries]
