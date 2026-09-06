from datetime import date
from typing import Optional

from pydantic import BaseModel


class FamilyMemberCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: date
    relationship: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class FamilyMemberUpdate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: date
    relationship: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

from datetime import date
from typing import Optional

from pydantic import BaseModel


class FamilyEventCreate(BaseModel):
    title: str
    event_date: date
    event_type: str
    description: Optional[str] = None


class FamilyEventUpdate(BaseModel):
    title: str
    event_date: date
    event_type: str
    description: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    family_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    family_id: int
    family_name: str 

class MonthPhotoCreate(BaseModel):
    year: int
    month: int
    photo_url: str
    caption: Optional[str] = None


class MonthPhotoUpdate(BaseModel):
    year: int
    month: int
    photo_url: str
    caption: Optional[str] = None  