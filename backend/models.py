from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship as orm_relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password = Column(String, nullable=False)

    families = orm_relationship(
        "Family",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    owner = orm_relationship(
        "User",
        back_populates="families",
    )

    members = orm_relationship(
        "FamilyMember",
        back_populates="family",
        cascade="all, delete-orphan",
    )

    events = orm_relationship(
        "FamilyEvent",
        back_populates="family",
        cascade="all, delete-orphan",
    )

    month_photos = orm_relationship(
        "MonthPhoto",
        back_populates="family",
        cascade="all, delete-orphan",
    )


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

    family_id = Column(
        Integer,
        ForeignKey("families.id"),
        nullable=False,
    )

    family = orm_relationship(
        "Family",
        back_populates="members",
    )


class FamilyEvent(Base):
    __tablename__ = "family_events"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    event_date = Column(Date, nullable=False)

    event_type = Column(String, nullable=False)

    description = Column(Text, nullable=True)

    family_id = Column(
        Integer,
        ForeignKey("families.id"),
        nullable=False,
    )

    family = orm_relationship(
        "Family",
        back_populates="events",
    )


class MonthPhoto(Base):
    __tablename__ = "month_photos"

    id = Column(Integer, primary_key=True, index=True)

    year = Column(Integer, nullable=False)

    month = Column(Integer, nullable=False)

    photo_url = Column(String, nullable=False)

    caption = Column(String, nullable=True)

    family_id = Column(
        Integer,
        ForeignKey("families.id"),
        nullable=False,
    )

    family = orm_relationship(
        "Family",
        back_populates="month_photos",
    )