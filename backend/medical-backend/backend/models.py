from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# ─────────────────────────────────────────────
# PATIENTS (core entity referenced by all modules)
# ─────────────────────────────────────────────
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True)       # Medical Record Number
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    blood_group = Column(String)
    contact = Column(String)
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────
# BEDS & WARDS
# ─────────────────────────────────────────────
class Bed(Base):
    __tablename__ = "beds"
    id = Column(Integer, primary_key=True)
    ward = Column(String)           # ICU, General, Pediatrics, Emergency, Maternity, Surgical
    bed_number = Column(String, unique=True)
    status = Column(String)         # occupied, available, maintenance, reserved
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    patient_name = Column(String, nullable=True)
    admitted_at = Column(DateTime, nullable=True)
    expected_discharge = Column(DateTime, nullable=True)
    floor = Column(Integer, default=1)

# ─────────────────────────────────────────────
# EMERGENCY ROOM
# ─────────────────────────────────────────────
class ERPatient(Base):
    __tablename__ = "er_patients"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    chief_complaint = Column(String)
    triage_level = Column(Integer)  # 1=Resuscitation, 2=Emergency, 3=Urgent, 4=Semi-urgent, 5=Non-urgent
    arrived_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)         # waiting, in_treatment, admitted, discharged
    wait_minutes = Column(Integer, default=0)
    assigned_doctor = Column(String, nullable=True)
    vitals_bp = Column(String, nullable=True)
    vitals_pulse = Column(Integer, nullable=True)
    vitals_spo2 = Column(Float, nullable=True)

# ─────────────────────────────────────────────
# PHARMACY
# ─────────────────────────────────────────────
class PharmacyItem(Base):
    __tablename__ = "pharmacy_items"
    id = Column(Integer, primary_key=True)
    drug_name = Column(String)
    generic_name = Column(String)
    category = Column(String)       # antibiotic, analgesic, cardiac, diabetes, emergency
    stock_quantity = Column(Integer)
    minimum_threshold = Column(Integer)
    unit = Column(String)           # tablets, vials, ml, units
    batch_number = Column(String)
    expiry_date = Column(String)
    location = Column(String)       # shelf/rack identifier
    cost_per_unit = Column(Float)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String)
    drug_name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    prescribed_by = Column(String)
    status = Column(String)         # pending, dispensed, cancelled
    prescribed_at = Column(DateTime, default=datetime.utcnow)

# ─────────────────────────────────────────────
# LABORATORY
# ─────────────────────────────────────────────
class LabTest(Base):
    __tablename__ = "lab_tests"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String)
    test_name = Column(String)
    test_code = Column(String)
    category = Column(String)       # hematology, biochemistry, microbiology, serology
    ordered_by = Column(String)
    ordered_at = Column(DateTime, default=datetime.utcnow)
    sample_collected_at = Column(DateTime, nullable=True)
    status = Column(String)         # ordered, sample_collected, processing, completed, critical
    result_value = Column(String, nullable=True)
    result_unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    is_critical = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    turnaround_minutes = Column(Integer, nullable=True)

# ─────────────────────────────────────────────
# STAFF
# ─────────────────────────────────────────────
class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    role = Column(String)           # doctor, nurse, technician, admin
    department = Column(String)
    shift = Column(String)          # morning, evening, night
    status = Column(String)         # on_duty, off_duty, on_leave
    scheduled = Column(Boolean, default=True)
    contact = Column(String)

# ─────────────────────────────────────────────
# OPERATION THEATRE
# ─────────────────────────────────────────────
class Surgery(Base):
    __tablename__ = "surgeries"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String)
    procedure_name = Column(String)
    surgeon = Column(String)
    anesthesiologist = Column(String)
    ot_room = Column(String)        # OT-1, OT-2, OT-3
    scheduled_at = Column(DateTime)
    status = Column(String)         # scheduled, in_progress, completed, postponed
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

# ─────────────────────────────────────────────
# NURSING
# ─────────────────────────────────────────────
class VitalRecord(Base):
    __tablename__ = "vital_records"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String)
    ward = Column(String)
    bed_number = Column(String)
    recorded_by = Column(String)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    blood_pressure = Column(String)
    pulse = Column(Integer)
    temperature = Column(Float)
    spo2 = Column(Float)
    respiratory_rate = Column(Integer)
    blood_glucose = Column(Float, nullable=True)
    fall_risk_score = Column(Integer, default=0)  # 0-100

# ─────────────────────────────────────────────
# ALERTS
# ─────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    alert_type = Column(String)     # critical, warning, info
    module = Column(String)         # beds, er, pharmacy, lab, nursing, ot, staff
    title = Column(String)
    message = Column(String)
    patient_name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    escalation_level = Column(Integer, default=0)  # 0=new, 1=supervisor, 2=dept_head

# ─────────────────────────────────────────────
# IMAGING (RIS/PACS)
# ─────────────────────────────────────────────
class ImagingOrder(Base):
    __tablename__ = "imaging_orders"
    id = Column(Integer, primary_key=True)
    patient_name = Column(String)
    modality = Column(String)       # X-Ray, CT, MRI, Ultrasound
    body_part = Column(String)
    ordered_by = Column(String)
    ordered_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)         # ordered, scheduled, in_progress, reported
    radiologist = Column(String, nullable=True)
    report = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
