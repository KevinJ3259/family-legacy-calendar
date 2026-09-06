import os
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import auth
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


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)


security = HTTPBearer()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    payload = auth.decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def get_current_family(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    family = (
        db.query(models.Family)
        .filter(models.Family.owner_id == current_user.id)
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found",
        )

    return family


@app.get("/")
def home():
    return {
        "message": "Family Legacy Calendar API is running!"
    }


# ---------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------

@app.post("/register", response_model=schemas.TokenResponse)
def register_user(
    registration: schemas.UserRegister,
    db: Session = Depends(get_db),
):
    email = registration.email.strip().lower()

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    new_user = models.User(
        name=registration.name.strip(),
        email=email,
        hashed_password=auth.hash_password(
            registration.password
        ),
    )

    db.add(new_user)
    db.flush()

    new_family = models.Family(
        name=registration.family_name.strip(),
        owner_id=new_user.id,
    )

    db.add(new_family)
    db.commit()

    db.refresh(new_user)
    db.refresh(new_family)

    access_token = auth.create_access_token(
        {
            "sub": str(new_user.id),
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": new_user.name,
        "family_id": new_family.id,
        "family_name": new_family.name,
    }


@app.post("/login", response_model=schemas.TokenResponse)
def login_user(
    login: schemas.UserLogin,
    db: Session = Depends(get_db),
):
    email = login.email.strip().lower()

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not auth.verify_password(
        login.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    family = (
        db.query(models.Family)
        .filter(models.Family.owner_id == user.id)
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family not found.",
        )

    access_token = auth.create_access_token(
        {
            "sub": str(user.id),
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.name,
        "family_id": family.id,
        "family_name": family.name,
    }


@app.get("/me")
def get_me(
    current_user: models.User = Depends(get_current_user),
    family: models.Family = Depends(get_current_family),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "family_id": family.id,
        "family_name": family.name,
    }


# ---------------------------------------------------
# FAMILY MEMBERS
# ---------------------------------------------------

@app.post("/family-members")
def create_family_member(
    member: schemas.FamilyMemberCreate,
    family: models.Family = Depends(get_current_family),
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
        family_id=family.id,
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member


@app.get("/family-members")
def get_family_members(
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.family_id == family.id)
        .order_by(
            models.FamilyMember.last_name,
            models.FamilyMember.first_name,
        )
        .all()
    )


@app.put("/family-members/{member_id}")
def update_family_member(
    member_id: int,
    member: schemas.FamilyMemberUpdate,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == member_id,
            models.FamilyMember.family_id == family.id,
        )
        .first()
    )

    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found.",
        )

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
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == member_id,
            models.FamilyMember.family_id == family.id,
        )
        .first()
    )

    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found.",
        )

    db.delete(db_member)
    db.commit()

    return {
        "message": "Family member deleted successfully",
        "id": member_id,
    }


@app.get(
    "/family-members/{member_id}/birthday/{calendar_year}"
)
def get_birthday_info(
    member_id: int,
    calendar_year: int,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == member_id,
            models.FamilyMember.family_id == family.id,
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found.",
        )

    age = calendar_year - member.date_of_birth.year

    return {
        "id": member.id,
        "name": f"{member.first_name} {member.last_name}",
        "birthday": member.date_of_birth.strftime("%B %d"),
        "calendar_year": calendar_year,
        "turning_age": age,
        "display": (
            f"{member.first_name} {member.last_name} - "
            f"{member.date_of_birth.strftime('%B %d')} - "
            f"Turning {age}"
        ),
    }


@app.get("/birthdays/{calendar_year}")
def get_birthdays_for_year(
    calendar_year: int,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    members = (
        db.query(models.FamilyMember)
        .filter(models.FamilyMember.family_id == family.id)
        .all()
    )

    birthdays = []

    for member in members:
        turning_age = (
            calendar_year - member.date_of_birth.year
        )

        birthdays.append(
            {
                "id": member.id,
                "name": (
                    f"{member.first_name} "
                    f"{member.last_name}"
                ),
                "birthday": (
                    member.date_of_birth.strftime("%B %d")
                ),
                "month": member.date_of_birth.month,
                "day": member.date_of_birth.day,
                "turning_age": turning_age,
                "display": (
                    f"{member.first_name} "
                    f"{member.last_name} - "
                    f"{member.date_of_birth.strftime('%B %d')} - "
                    f"Turning {turning_age}"
                ),
            }
        )

    birthdays.sort(
        key=lambda person: (
            person["month"],
            person["day"],
        )
    )

    return {
        "calendar_year": calendar_year,
        "birthdays": birthdays,
    }


# ---------------------------------------------------
# FAMILY EVENTS
# ---------------------------------------------------

@app.post("/family-events")
def create_family_event(
    event: schemas.FamilyEventCreate,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_event = models.FamilyEvent(
        title=event.title,
        event_date=event.event_date,
        event_type=event.event_type,
        description=event.description,
        family_id=family.id,
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return db_event


@app.get("/family-events")
def get_family_events(
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.FamilyEvent)
        .filter(models.FamilyEvent.family_id == family.id)
        .order_by(models.FamilyEvent.event_date)
        .all()
    )


@app.put("/family-events/{event_id}")
def update_family_event(
    event_id: int,
    event: schemas.FamilyEventUpdate,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_event = (
        db.query(models.FamilyEvent)
        .filter(
            models.FamilyEvent.id == event_id,
            models.FamilyEvent.family_id == family.id,
        )
        .first()
    )

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family event not found.",
        )

    db_event.title = event.title
    db_event.event_date = event.event_date
    db_event.event_type = event.event_type
    db_event.description = event.description

    db.commit()
    db.refresh(db_event)

    return db_event


@app.delete("/family-events/{event_id}")
def delete_family_event(
    event_id: int,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_event = (
        db.query(models.FamilyEvent)
        .filter(
            models.FamilyEvent.id == event_id,
            models.FamilyEvent.family_id == family.id,
        )
        .first()
    )

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family event not found.",
        )

    db.delete(db_event)
    db.commit()

    return {
        "message": "Family event deleted successfully",
        "event_id": event_id,
    }

@app.post("/month-photos")
def create_month_photo(
    photo: schemas.MonthPhotoCreate,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    existing_photo = (
        db.query(models.MonthPhoto)
        .filter(
            models.MonthPhoto.family_id == family.id,
            models.MonthPhoto.year == photo.year,
            models.MonthPhoto.month == photo.month,
        )
        .first()
    )

    if existing_photo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A photo already exists for this month.",
        )

    db_photo = models.MonthPhoto(
        year=photo.year,
        month=photo.month,
        photo_url=photo.photo_url,
        caption=photo.caption,
        family_id=family.id,
    )

    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)

    return db_photo


@app.get("/month-photos")
def get_month_photos(
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.MonthPhoto)
        .filter(models.MonthPhoto.family_id == family.id)
        .order_by(
            models.MonthPhoto.year,
            models.MonthPhoto.month,
        )
        .all()
    )


@app.put("/month-photos/{photo_id}")
def update_month_photo(
    photo_id: int,
    photo: schemas.MonthPhotoUpdate,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_photo = (
        db.query(models.MonthPhoto)
        .filter(
            models.MonthPhoto.id == photo_id,
            models.MonthPhoto.family_id == family.id,
        )
        .first()
    )

    if not db_photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Month photo not found.",
        )

    db_photo.year = photo.year
    db_photo.month = photo.month
    db_photo.photo_url = photo.photo_url
    db_photo.caption = photo.caption

    db.commit()
    db.refresh(db_photo)

    return db_photo


@app.delete("/month-photos/{photo_id}")
def delete_month_photo(
    photo_id: int,
    family: models.Family = Depends(get_current_family),
    db: Session = Depends(get_db),
):
    db_photo = (
        db.query(models.MonthPhoto)
        .filter(
            models.MonthPhoto.id == photo_id,
            models.MonthPhoto.family_id == family.id,
        )
        .first()
    )

    if not db_photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Month photo not found.",
        )

    db.delete(db_photo)
    db.commit()

    return {
        "message": "Month photo deleted successfully",
        "photo_id": photo_id,
    }

# ---------------------------------------------------
# IMAGE UPLOADS
# ---------------------------------------------------

@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    family: models.Family = Depends(get_current_family),
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG, and WEBP images are allowed.",
        )

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file extension.",
        )

    unique_filename = (
        f"family_{family.id}_{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename,
    )

    contents = await file.read()

    with open(file_path, "wb") as image_file:
        image_file.write(contents)

    return {
        "photo_url": (
            f"http://127.0.0.1:8000/uploads/{unique_filename}"
        )
    }

