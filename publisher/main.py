from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import Base, Sensor, Channel, NumericalValue, NonNumericalValue
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

@app.get("/sensorData")
def get_sensor_data_all(sensor_name: str = Query(...)):
    print(sensor_name)
    print("came here")
    db = SessionLocal()
    result = {"Numerical": [], "NonNumerical": []}

    numerical = (
        db.query(NumericalValue)
        .filter(NumericalValue.sensor_name == sensor_name)
        .order_by(NumericalValue.time.asc())
        .all()
    )
    for entry in numerical:
        result["Numerical"].append({
            "channel_id": entry.channel_id,
            "value": float(entry.value),
            "time": entry.time.isoformat(),
        })

    non_numerical = (
        db.query(NonNumericalValue)
        .filter(NonNumericalValue.sensor_name == sensor_name)
        .order_by(NonNumericalValue.time.asc())
        .all()
    )
    for entry in non_numerical:
        result["NonNumerical"].append({
            "channel_id": entry.channel_id,
            "value": entry.value,
            "time": entry.time.isoformat(),
        })

    db.close()
    return {"sensor_name": sensor_name, "data": result}