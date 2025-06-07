from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, TIMESTAMP, func

Base = declarative_base()

class SensorData(Base):
    __tablename__ = 'sensor_data'

    id = Column(Integer, primary_key=True, index=True)
    guid = Column(String, index=True)         
    type = Column(String, index=True)         
    value = Column(String)
    timestamp = Column(TIMESTAMP, server_default=func.now())
