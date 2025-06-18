from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, validates
from sqlalchemy import Integer, String, Float, TIMESTAMP, ForeignKey
from datetime import datetime

class Base(DeclarativeBase):
    pass

class Sensor(Base):
    __tablename__ = 'Sensor'
    name: Mapped[str] = mapped_column(String(128), primary_key=True, nullable=False)
    object_id: Mapped[int] = mapped_column(Integer, nullable=False)
    type_id: Mapped[int] = mapped_column(Integer, nullable=False)

class Channel(Base):
    __tablename__ = 'Channel'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    unit: Mapped[str] = mapped_column(String(128), nullable=True)
    type_id: Mapped[int] = mapped_column(Integer, nullable=False)

class NumericalValue(Base):
    __tablename__ = 'NumericalValue'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    channel_id: Mapped[int] = mapped_column(Integer, nullable=False)
    time: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    sensor_name: Mapped[str] = mapped_column(ForeignKey("Sensor.name"))

class NonNumericalValue(Base):
    __tablename__ = 'NonNumericalValue'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    value: Mapped[str] = mapped_column(String(128), nullable=False)
    channel_id: Mapped[int] = mapped_column(Integer, nullable=False)
    time: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    sensor_name: Mapped[str] = mapped_column(ForeignKey("Sensor.name"))