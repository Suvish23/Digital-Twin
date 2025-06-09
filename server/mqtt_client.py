import paho.mqtt.client as mqtt
import json
from database import SessionLocal
from models import SensorData

BROKER = "localhost"
PORT = 1883
TOPIC = "building/sensor-data"

def on_connect(client, userdata, flags, rc):
    print("Connected with result code", rc)
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        guid = data.get("guid")
        value = data.get("value")
        sensor_type = data.get("type") 

        if guid and value and sensor_type:
            db = SessionLocal()
            entry = SensorData(guid=guid, type=sensor_type, value=value)
            db.add(entry)
            db.commit()
            db.close()
            print(f"Stored {sensor_type} for {guid}: {value}")
    except Exception as e:
        print("Error in on_message:", e)
        import traceback
        traceback.print_exc()

def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)
    client.loop_forever()
