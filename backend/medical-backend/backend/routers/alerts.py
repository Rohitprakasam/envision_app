from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Alert
from datetime import datetime

router = APIRouter()

@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.is_resolved == False)\
               .order_by(Alert.alert_type.desc(), Alert.created_at.desc()).all()
    return [{
        "id": a.id, "type": a.alert_type, "module": a.module,
        "title": a.title, "message": a.message,
        "patient_name": a.patient_name, "department": a.department,
        "escalation_level": a.escalation_level,
        "created_at": str(a.created_at),
        "age_minutes": int((datetime.utcnow() - a.created_at).total_seconds() / 60)
    } for a in alerts]

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, resolved_by: str = "Admin", db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_resolved = True
        alert.resolved_by = resolved_by
        alert.resolved_at = datetime.utcnow()
        db.commit()
    return {"success": True}

@router.get("/summary")
def alert_summary(db: Session = Depends(get_db)):
    active = db.query(Alert).filter(Alert.is_resolved == False).all()
    return {
        "total": len(active),
        "critical": sum(1 for a in active if a.alert_type == "critical"),
        "warning": sum(1 for a in active if a.alert_type == "warning"),
        "info": sum(1 for a in active if a.alert_type == "info"),
        "by_module": {
            module: sum(1 for a in active if a.module == module)
            for module in set(a.module for a in active)
        }
    }
