from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import Base, SensorData
from database import engine, SessionLocal
from contextlib import asynccontextmanager
import threading
from mqtt_client import start_mqtt  


@asynccontextmanager
async def lifespan(app: FastAPI):
    mqtt_thread = threading.Thread(target=start_mqtt, daemon=True)
    mqtt_thread.start()
    yield  

app = FastAPI(lifespan=lifespan)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

USERS = {
    "admin": {"password": "pass", "role": "admin"},
    "suvish": {"password": "1234", "role": "user"},
}


class LoginResponse(BaseModel):
    token: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Routes
@app.get("/")
def root():
    return {"message": "Backend running"}

@app.post("/login")
def login(payload: LoginRequest):
    user = USERS.get(payload.username)
    if not user:
        raise HTTPException(status_code=401, detail="User does not exist")
    if user["password"] != payload.password:
        raise HTTPException(status_code=403, detail="Incorrect password")
    return {"token": f"{payload.username}-token", "role": user["role"]}

@app.get("/protected")
def protected(token: str = ""):
    if not token.endswith("-token"):
        raise HTTPException(status_code=403, detail="Invalid token format")
    username = token.replace("-token", "")
    user = USERS.get(username)
    if not user:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if user["role"] == "admin":
        return {"data": "All sensitive admin data and full access"}
    elif user["role"] == "user":
        return {"data": "Limited user data: read-only access"}
    else:
        raise HTTPException(status_code=403, detail="Unknown role")

# @app.get("/sensorData")
# def get_sensor_data(
#     guid: str = Query(...),
# ):
#     db = SessionLocal()
#     types = ["temperature", "humidity", "pressure"]

#     result = {}
#     for t in types:
#         entry = (
#             db.query(SensorData)
#             .filter(SensorData.guid == guid, SensorData.type == t)
#             .order_by(SensorData.timestamp.desc())
#             .first()
#         )
#         result[t] = entry.value if entry else None
#     db.close()
#     print(result)
#     return {
#         "guid": guid,
#         "sensors": result
#     }

@app.get("/sensorData")
def get_sensor_data_all(guid: str = Query(...)):
    print(guid)
    db = SessionLocal()
    types = ["temperature", "humidity", "pressure"]

    result = {}
    for sensor_type in types:
        entries = (
            db.query(SensorData)
            .filter(SensorData.guid == guid, SensorData.type == sensor_type)
            .order_by(SensorData.timestamp.asc())
            .all()
        )
        result[sensor_type] = [
            {"timestamp": entry.timestamp.isoformat(), "value": float(entry.value)}
            for entry in entries
        ]
    db.close()
    return {"guid": guid, "sensors": result}

