from sqlalchemy import Column, Integer, String, Date, Text
from database import Base


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String, nullable=False)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=False)

    date_of_birth = Column(Date, nullable=False)

    relationship = Column(String, nullable=True)

    photo_url = Column(String, nullable=True)

    notes = Column(Text, nullable=True)