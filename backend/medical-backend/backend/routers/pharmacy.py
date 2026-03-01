from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import PharmacyItem, Prescription

router = APIRouter()

@router.get("/stock")
def get_stock(db: Session = Depends(get_db)):
    items = db.query(PharmacyItem).all()
    return [{
        "id": i.id, "drug_name": i.drug_name, "generic_name": i.generic_name,
        "category": i.category, "stock_quantity": i.stock_quantity,
        "minimum_threshold": i.minimum_threshold, "unit": i.unit,
        "expiry_date": i.expiry_date, "location": i.location,
        "status": "critical" if i.stock_quantity < i.minimum_threshold * 0.5
                  else "low" if i.stock_quantity < i.minimum_threshold
                  else "ok",
        "stock_percentage": round(i.stock_quantity / (i.minimum_threshold * 3) * 100)
    } for i in items]

@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db)):
    items = db.query(PharmacyItem).filter(
        PharmacyItem.stock_quantity < PharmacyItem.minimum_threshold).all()
    return [{"drug_name": i.drug_name, "current": i.stock_quantity,
             "required": i.minimum_threshold, "shortfall": i.minimum_threshold - i.stock_quantity,
             "severity": "critical" if i.stock_quantity < i.minimum_threshold * 0.5 else "low"
             } for i in items]

@router.get("/prescriptions")
def get_prescriptions(db: Session = Depends(get_db)):
    rx = db.query(Prescription).order_by(Prescription.prescribed_at.desc()).limit(20).all()
    return [{"id": r.id, "patient_name": r.patient_name, "drug_name": r.drug_name,
             "dosage": r.dosage, "prescribed_by": r.prescribed_by,
             "status": r.status, "prescribed_at": str(r.prescribed_at)} for r in rx]
