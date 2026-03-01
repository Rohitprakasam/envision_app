from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Bed

router = APIRouter()

@router.get("/all")
def get_all_beds(db: Session = Depends(get_db)):
    beds = db.query(Bed).all()
    return [{"id": b.id, "ward": b.ward, "bed_number": b.bed_number,
             "status": b.status, "patient_name": b.patient_name,
             "admitted_at": str(b.admitted_at) if b.admitted_at else None,
             "expected_discharge": str(b.expected_discharge) if b.expected_discharge else None,
             "floor": b.floor} for b in beds]

@router.get("/summary")
def bed_summary(db: Session = Depends(get_db)):
    wards = ["ICU", "General", "Pediatrics", "Emergency", "Maternity", "Surgical"]
    result = []
    for ward in wards:
        total = db.query(Bed).filter(Bed.ward == ward).count()
        occupied = db.query(Bed).filter(Bed.ward == ward, Bed.status == "occupied").count()
        maintenance = db.query(Bed).filter(Bed.ward == ward, Bed.status == "maintenance").count()
        result.append({
            "ward": ward, "total": total, "occupied": occupied,
            "available": total - occupied - maintenance,
            "maintenance": maintenance,
            "occupancy_pct": round(occupied / total * 100) if total > 0 else 0
        })
    return result

@router.put("/{bed_id}/status")
def update_bed_status(bed_id: int, status: str, db: Session = Depends(get_db)):
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if bed:
        bed.status = status
        db.commit()
    return {"success": True}
