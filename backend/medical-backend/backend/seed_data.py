from database import SessionLocal, engine, Base
from models import *
from faker import Faker
import random
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)
fake = Faker('en_IN')

def clear_and_seed():
    db = SessionLocal()
    
    # Clear existing data
    for model in [Alert, VitalRecord, Surgery, LabTest, Prescription,
                  PharmacyItem, ERPatient, Bed, Staff, ImagingOrder, Patient]:
        db.query(model).delete()
    db.commit()

    # ── PATIENTS ──────────────────────────────────
    patients = []
    blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    for i in range(80):
        p = Patient(
            mrn=f"MRN{1000+i}",
            name=fake.name(),
            age=random.randint(18, 85),
            gender=random.choice(["Male", "Female"]),
            blood_group=random.choice(blood_groups),
            contact=fake.phone_number(),
            address=fake.address()
        )
        db.add(p)
        patients.append(p)
    db.commit()

    # ── BEDS ──────────────────────────────────────
    ward_config = {
        "ICU": 10, "General": 30, "Pediatrics": 12,
        "Emergency": 8, "Maternity": 10, "Surgical": 15
    }
    bed_index = 0
    for ward, count in ward_config.items():
        for i in range(1, count + 1):
            occupied = random.random() > 0.22
            pt = patients[bed_index % len(patients)] if occupied else None
            admitted = datetime.utcnow() - timedelta(hours=random.randint(2, 96)) if occupied else None
            db.add(Bed(
                ward=ward,
                bed_number=f"{ward[:3].upper()}-{i:02d}",
                status="occupied" if occupied else random.choice(["available", "available", "maintenance"]),
                patient_id=pt.id if pt else None,
                patient_name=pt.name if pt else None,
                admitted_at=admitted,
                expected_discharge=admitted + timedelta(days=random.randint(1, 7)) if admitted else None,
                floor=random.randint(1, 4)
            ))
            bed_index += 1
    db.commit()

    # ── ER PATIENTS ───────────────────────────────
    complaints = [
        "Chest pain", "Shortness of breath", "Severe headache", "Abdominal pain",
        "High fever", "Trauma - road accident", "Seizure", "Unconscious",
        "Allergic reaction", "Stroke symptoms", "Fracture", "Burns"
    ]
    doctors = ["Dr. Sharma", "Dr. Patel", "Dr. Iyer", "Dr. Khan", "Dr. Nair"]
    for _ in range(random.randint(12, 22)):
        wait = random.randint(5, 110)
        triage = random.choices([1,2,3,4,5], weights=[5,15,40,30,10])[0]
        db.add(ERPatient(
            name=fake.name(),
            age=random.randint(5, 90),
            chief_complaint=random.choice(complaints),
            triage_level=triage,
            arrived_at=datetime.utcnow() - timedelta(minutes=wait),
            status=random.choices(["waiting","waiting","in_treatment","admitted"], weights=[40,20,30,10])[0],
            wait_minutes=wait,
            assigned_doctor=random.choice(doctors) if triage <= 2 else None,
            vitals_bp=f"{random.randint(90,160)}/{random.randint(60,100)}",
            vitals_pulse=random.randint(55, 130),
            vitals_spo2=round(random.uniform(92, 100), 1)
        ))
    db.commit()

    # ── PHARMACY ──────────────────────────────────
    drugs = [
        ("Paracetamol 500mg", "Paracetamol", "analgesic", 450, 100, "tablets"),
        ("Amoxicillin 500mg", "Amoxicillin", "antibiotic", 60, 150, "capsules"),
        ("Insulin Glargine 100IU", "Insulin Glargine", "diabetes", 14, 25, "vials"),
        ("Morphine Sulfate 10mg", "Morphine", "analgesic", 9, 20, "vials"),
        ("Metformin 500mg", "Metformin", "diabetes", 380, 100, "tablets"),
        ("Atorvastatin 20mg", "Atorvastatin", "cardiac", 22, 60, "tablets"),
        ("Salbutamol Inhaler", "Salbutamol", "respiratory", 5, 25, "inhalers"),
        ("Heparin 5000IU", "Heparin", "anticoagulant", 38, 30, "vials"),
        ("Ceftriaxone 1g", "Ceftriaxone", "antibiotic", 45, 50, "vials"),
        ("Adrenaline 1mg", "Epinephrine", "emergency", 8, 15, "vials"),
        ("Normal Saline 500ml", "Sodium Chloride", "iv_fluid", 120, 80, "bags"),
        ("Dextrose 5% 500ml", "Dextrose", "iv_fluid", 85, 60, "bags"),
        ("Pantoprazole 40mg", "Pantoprazole", "gastric", 200, 80, "tablets"),
        ("Ondansetron 4mg", "Ondansetron", "antiemetic", 110, 50, "tablets"),
        ("Diazepam 5mg", "Diazepam", "sedative", 7, 20, "tablets"),
    ]
    for name, generic, cat, qty, threshold, unit in drugs:
        db.add(PharmacyItem(
            drug_name=name, generic_name=generic, category=cat,
            stock_quantity=qty, minimum_threshold=threshold, unit=unit,
            batch_number=f"B{random.randint(10000,99999)}",
            expiry_date=f"202{random.randint(5,7)}-{random.randint(1,12):02d}-28",
            location=f"Rack-{random.randint(1,12)}-Shelf-{random.randint(1,5)}",
            cost_per_unit=round(random.uniform(2, 850), 2)
        ))
    db.commit()

    # ── LAB TESTS ─────────────────────────────────
    test_catalog = [
        ("CBC", "CBC001", "hematology"), ("HbA1c", "HBA001", "biochemistry"),
        ("LFT", "LFT001", "biochemistry"), ("RFT", "RFT001", "biochemistry"),
        ("Blood Culture", "BC001", "microbiology"), ("Urine R/M", "UR001", "microbiology"),
        ("Lipid Profile", "LP001", "biochemistry"), ("Thyroid Panel", "TFT001", "serology"),
        ("Troponin I", "TROP001", "biochemistry"), ("D-Dimer", "DD001", "hematology"),
        ("COVID Antigen", "COV001", "serology"), ("PT/INR", "PT001", "hematology"),
    ]
    for i in range(50):
        test = random.choice(test_catalog)
        hours_ago = random.randint(0, 8)
        completed = hours_ago < 5 and random.random() > 0.3
        is_critical = random.random() < 0.08
        db.add(LabTest(
            patient_id=random.choice(patients).id,
            patient_name=random.choice(patients).name,
            test_name=test[0], test_code=test[1], category=test[2],
            ordered_by=random.choice(doctors),
            ordered_at=datetime.utcnow() - timedelta(hours=hours_ago),
            sample_collected_at=datetime.utcnow() - timedelta(hours=hours_ago-0.5) if hours_ago > 0.5 else None,
            status="completed" if completed else random.choice(["ordered","sample_collected","processing"]),
            result_value=str(round(random.uniform(3.5, 15.0), 1)) if completed else None,
            is_critical=is_critical,
            completed_at=datetime.utcnow() - timedelta(minutes=random.randint(10,120)) if completed else None,
            turnaround_minutes=random.randint(30, 240) if completed else None
        ))
    db.commit()

    # ── STAFF ─────────────────────────────────────
    departments = ["Emergency", "ICU", "General Medicine", "Surgery", "Pediatrics", "Pharmacy", "Lab"]
    roles = [("doctor", 15), ("nurse", 35), ("technician", 10), ("admin", 5)]
    for role, count in roles:
        for _ in range(count):
            shift = random.choice(["morning", "evening", "night"])
            on_duty = shift == "morning" or random.random() > 0.4
            db.add(Staff(
                name=fake.name(), role=role,
                department=random.choice(departments),
                shift=shift,
                status="on_duty" if on_duty else random.choice(["off_duty", "on_leave"]),
                scheduled=True,
                contact=fake.phone_number()
            ))
    db.commit()

    # ── SURGERIES ─────────────────────────────────
    procedures = [
        "Appendectomy", "Cholecystectomy", "Hernia Repair", "CABG",
        "Total Knee Replacement", "Cataract Surgery", "C-Section",
        "Tonsillectomy", "Spinal Fusion", "Thyroidectomy"
    ]
    surgeons = ["Dr. Mehta", "Dr. Reddy", "Dr. Singh", "Dr. Thomas"]
    anesthesiologists = ["Dr. Kapoor", "Dr. Joshi", "Dr. Rao"]
    for i in range(8):
        scheduled = datetime.utcnow() + timedelta(hours=random.randint(-2, 12))
        status = "completed" if scheduled < datetime.utcnow() - timedelta(hours=1) else \
                 "in_progress" if abs((scheduled - datetime.utcnow()).total_seconds()) < 3600 else "scheduled"
        db.add(Surgery(
            patient_id=random.choice(patients).id,
            patient_name=random.choice(patients).name,
            procedure_name=random.choice(procedures),
            surgeon=random.choice(surgeons),
            anesthesiologist=random.choice(anesthesiologists),
            ot_room=f"OT-{random.randint(1,3)}",
            scheduled_at=scheduled,
            status=status,
            duration_minutes=random.randint(45, 240) if status == "completed" else None
        ))
    db.commit()

    # ── VITALS ────────────────────────────────────
    wards_list = ["ICU", "General", "Pediatrics", "Surgical"]
    nurses = ["Nurse Priya", "Nurse Ravi", "Nurse Sunita", "Nurse Ahmed", "Nurse Leela"]
    for i in range(40):
        age = random.randint(18, 85)
        fall_risk = random.randint(0, 100)
        db.add(VitalRecord(
            patient_id=random.choice(patients).id,
            patient_name=random.choice(patients).name,
            ward=random.choice(wards_list),
            bed_number=f"GEN-{random.randint(1,30):02d}",
            recorded_by=random.choice(nurses),
            recorded_at=datetime.utcnow() - timedelta(minutes=random.randint(0, 240)),
            blood_pressure=f"{random.randint(90,165)}/{random.randint(60,100)}",
            pulse=random.randint(55, 130),
            temperature=round(random.uniform(36.1, 39.8), 1),
            spo2=round(random.uniform(91, 100), 1),
            respiratory_rate=random.randint(12, 28),
            blood_glucose=round(random.uniform(70, 350), 1) if random.random() > 0.4 else None,
            fall_risk_score=fall_risk
        ))
    db.commit()

    # ── ALERTS ────────────────────────────────────
    alert_templates = [
        ("critical", "pharmacy", "Critical Stock Alert", "Salbutamol Inhaler stock at 5 units — below threshold of 25", None, "Pharmacy"),
        ("critical", "lab", "Critical Lab Result", "Troponin I critically elevated for patient in ICU-03", "ICU Patient", "ICU"),
        ("critical", "beds", "ICU Capacity Alert", "ICU occupancy at 95% — only 1 bed available", None, "ICU"),
        ("warning", "er", "ER Wait Time Warning", "Average ER wait time exceeded 60 minutes", None, "Emergency"),
        ("warning", "pharmacy", "Drug Expiry Warning", "Morphine Sulfate batch B77234 expires in 14 days", None, "Pharmacy"),
        ("warning", "staff", "Staff Coverage Warning", "Night shift in Pediatrics has only 2 nurses scheduled vs 4 required", None, "Pediatrics"),
        ("warning", "lab", "Delayed Lab Results", "8 lab orders pending for >2 hours without processing", None, "Laboratory"),
        ("info", "ot", "OT Schedule Update", "Surgery OT-2 at 3:00 PM confirmed — team assembled", None, "OT"),
        ("info", "beds", "Discharge Ready", "3 patients in General ward cleared for discharge", None, "General"),
        ("critical", "nursing", "Fall Risk Alert", "Patient in GEN-14 has fall risk score 89 — high risk", "GEN-14 Patient", "General"),
    ]
    for alert_type, module, title, message, patient_name, dept in alert_templates:
        db.add(Alert(
            alert_type=alert_type, module=module, title=title,
            message=message, patient_name=patient_name, department=dept,
            is_resolved=False,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(1, 120)),
            escalation_level=random.choice([0, 0, 0, 1])
        ))
    db.commit()

    # ── IMAGING ───────────────────────────────────
    modalities = ["X-Ray", "CT Scan", "MRI", "Ultrasound"]
    body_parts = ["Chest", "Abdomen", "Brain", "Spine", "Knee", "Pelvis", "Neck"]
    radiologists = ["Dr. Verma", "Dr. Pillai"]
    for _ in range(15):
        ordered_hrs = random.randint(0, 6)
        completed = ordered_hrs > 2 and random.random() > 0.4
        db.add(ImagingOrder(
            patient_name=random.choice(patients).name,
            modality=random.choice(modalities),
            body_part=random.choice(body_parts),
            ordered_by=random.choice(doctors),
            ordered_at=datetime.utcnow() - timedelta(hours=ordered_hrs),
            status="reported" if completed else random.choice(["ordered","scheduled","in_progress"]),
            radiologist=random.choice(radiologists) if completed else None,
            report="No acute findings. Normal study." if completed else None,
            completed_at=datetime.utcnow() - timedelta(minutes=random.randint(10,60)) if completed else None
        ))
    db.commit()
    db.close()
    print("✅ Database seeded successfully")
    print(f"   Patients: 80 | Beds: {sum(ward_config.values())} | ER: ~15 | Pharmacy: 15 drugs")
    print(f"   Lab: 50 tests | Staff: 65 | Surgeries: 8 | Alerts: 10 | Vitals: 40")

if __name__ == "__main__":
    clear_and_seed()
