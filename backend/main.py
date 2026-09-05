from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Family Legacy Calendar API",
    description="Backend API for creating personalized family calendars.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Family Legacy Calendar API is running!"
    }


@app.post("/family-members")
def create_family_member(
    member: schemas.FamilyMemberCreate,
    db: Session = Depends(get_db),
):
    db_member = models.FamilyMember(
        first_name=member.first_name,
        middle_name=member.middle_name,
        last_name=member.last_name,
        date_of_birth=member.date_of_birth,
        relationship=member.relationship,
        photo_url=member.photo_url,
        notes=member.notes,
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member


@app.get("/family-members/{member_id}/birthday/{calendar_year}")
def get_birthday_info(
    member_id: int,
    calendar_year: int,
    db: Session = Depends(get_db),
):
    member = (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.id == member_id)
        .first()
    )

    if not member:
        return {"error": "Family member not found"}

    age = calendar_year - member.date_of_birth.year

    return {
        "id": member.id,
        "name": f"{member.first_name} {member.last_name}",
        "birthday": member.date_of_birth.strftime("%B %d"),
        "calendar_year": calendar_year,
        "turning_age": age,
        "display": (
            f"{member.first_name} {member.last_name} - "
            f"{member.date_of_birth.strftime('%B %d')} - Turning {age}"
        ),
    }

@app.get("/family-members")
def get_family_members(db: Session = Depends(get_db)):
    members = db.query(models.FamilyMember).all()
    return members

@app.get("/birthdays/{calendar_year}")
def get_birthdays_for_year(
    calendar_year: int,
    db: Session = Depends(get_db),
):
    members = db.query(models.FamilyMember).all()

    birthdays = []

    for member in members:
        turning_age = calendar_year - member.date_of_birth.year

        birthdays.append(
            {
                "id": member.id,
                "name": f"{member.first_name} {member.last_name}",
                "birthday": member.date_of_birth.strftime("%B %d"),
                "month": member.date_of_birth.month,
                "day": member.date_of_birth.day,
                "turning_age": turning_age,
                "display": (
                    f"{member.first_name} {member.last_name} - "
                    f"{member.date_of_birth.strftime('%B %d')} - "
                    f"Turning {turning_age}"
                ),
            }
        )

    birthdays.sort(key=lambda person: (person["month"], person["day"]))

    return {
        "calendar_year": calendar_year,
        "birthdays": birthdays,
    }

@app.delete("/family-members/{member_id}")
def delete_family_member(
    member_id: int,
    db: Session = Depends(get_db),
):
    member = (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.id == member_id)
        .first()
    )

    if not member:
        return {"error": "Family member not found"}

    db.delete(member)
    db.commit()

    return {
        "message": "Family member deleted successfully",
        "member_id": member_id,
    }

@app.put("/family-members/{member_id}")
def update_family_member(
    member_id: int,
    member: schemas.FamilyMemberUpdate,
    db: Session = Depends(get_db),
):
    db_member = (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.id == member_id)
        .first()
    )

    if not db_member:
        return {"error": "Family member not found"}

    db_member.first_name = member.first_name
    db_member.middle_name = member.middle_name
    db_member.last_name = member.last_name
    db_member.date_of_birth = member.date_of_birth
    db_member.relationship = member.relationship
    db_member.photo_url = member.photo_url
    db_member.notes = member.notes

    db.commit()
    db.refresh(db_member)

    return db_member

@app.delete("/family-members/{member_id}")
def delete_family_member(
    member_id: int,
    db: Session = Depends(get_db),
):
    member = (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.id == member_id)
        .first()
    )

    if not member:
        return {"error": "Family member not found"}

    db.delete(member)
    db.commit()

    return {
        "message": "Family member deleted successfully",
        "id": member_id,
    }