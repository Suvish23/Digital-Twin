import os
from dotenv import load_dotenv
import paho.mqtt.client as mqtt
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from models import NumericalValue, NonNumericalValue, Sensor, Channel
import logging

# Load env variables from .env file
load_dotenv()

BROKER = os.getenv("MQTT_BROKER")
PORT = int(os.getenv("MQTT_PORT", 1883))
USERNAME = os.getenv("MQTT_USERNAME")
PASSWORD = os.getenv("MQTT_PASSWORD")
TOPIC = os.getenv("MQTT_TOPIC")

logging.basicConfig(level=logging.INFO)

def get_channel_id(sensor_name: str, channel_name: str) -> int | None:
    with Session(SessionLocal()) as session:
        stmt = (
            select(Channel.id)
            .join(Sensor, Channel.type_id == Sensor.type_id)
            .where(Channel.name == channel_name)
            .where(Sensor.name == sensor_name)
        )
        return session.scalar(stmt)

def insert_value(value_obj):
    with Session(SessionLocal()) as session:
        session.add(value_obj)
        session.commit()
        logging.info(f"Inserted: {value_obj}")

def parse_and_store(msg):
    try:
        topic_parts = msg.topic.split("/")
        sensor_name = topic_parts[-2]
        channel_name = topic_parts[-1]
        channel_id = get_channel_id(sensor_name, channel_name)
        if channel_id is None:
            logging.warning(f"No channel found for sensor={sensor_name}, channel={channel_name}")
            return

        payload = msg.payload.decode()
        time_part, value_part = [x.strip() for x in payload.split(",")]

        month = int(time_part[0:2])
        day = int(time_part[2:4])
        year = int(time_part[4:8])
        hour = int(time_part[8:10])
        minute = int(time_part[10:12])
        second = int(time_part[12:14])
        microsecond = int(time_part[14:20])
        dt = datetime(year, month, day, hour, minute, second, microsecond)

        try:
            v = float(value_part)
            entry = NumericalValue(value=v, channel_id=channel_id, time=dt, sensor_name=sensor_name)
        except ValueError:
            entry = NonNumericalValue(value=value_part, channel_id=channel_id, time=dt, sensor_name=sensor_name)

        insert_value(entry)

    except Exception as e:
        logging.warning(f"Failed to parse message: {e}")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logging.info(f"Connected to MQTT broker successfully (rc={rc})")
        result, mid = client.subscribe(TOPIC)
        if result == mqtt.MQTT_ERR_SUCCESS:
            logging.info(f"Subscribed to topic: {TOPIC} (mid={mid})")
        else:
            logging.error(f"Failed to subscribe to topic {TOPIC} (result={result})")
    else:
        logging.error(f"Failed to connect, return code {rc}")

def on_subscribe(client, userdata, mid, granted_qos):
    logging.info(f"Subscription acknowledged: mid={mid}, granted_qos={granted_qos}")



def on_message(client, userdata, msg):
    print(msg)
    logging.info(f"Received message on topic {msg.topic}")
    parse_and_store(msg)


def start_mqtt():
    if not BROKER or not TOPIC:
        logging.error("BROKER or TOPIC not set properly in .env")
        return

    logging.info(f"Connecting to {BROKER}:{PORT} as '{USERNAME}' for topic '{TOPIC}'")

    client = mqtt.Client()
    if USERNAME and PASSWORD:
        client.username_pw_set(USERNAME, PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_subscribe = on_subscribe

    client.connect(BROKER, PORT, 60)
    
    logging.info("Starting MQTT network loop (blocking)")
    client.loop_forever()


