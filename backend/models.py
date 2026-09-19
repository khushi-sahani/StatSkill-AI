from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    designation = Column(String)
    department = Column(String)
    experience = Column(Integer)
    role = Column(String)