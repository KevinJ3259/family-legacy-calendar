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