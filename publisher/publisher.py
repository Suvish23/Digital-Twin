import json
import time
import random
import paho.mqtt.publish as publish

BROKER = "localhost"
PORT = 1883
TOPIC = "building/sensor-data"

sensors = [
    {"guid": "2erCOY2ZT6phYA1VMNL9xD", "type": "temperature"},
    {"guid": "2erCOY2ZT6phYA1VMNL9xD", "type": "humidity"},
    {"guid": "2erCOY2ZT6phYA1VMNL9xD", "type": "pressure"},

    {"guid": "0rkIGtEaj2Igj$BUxHTeVZ", "type": "temperature"},
    {"guid": "0rkIGtEaj2Igj$BUxHTeVZ", "type": "humidity"},
    {"guid": "0rkIGtEaj2Igj$BUxHTeVZ", "type": "pressure"},

    {"guid": "2erCOY2ZT6phYA1VMNLA2B", "type": "temperature"},
    {"guid": "2erCOY2ZT6phYA1VMNLA2B", "type": "humidity"},
    {"guid": "2erCOY2ZT6phYA1VMNLA2B", "type": "pressure"},
]


def generate_value(sensor_type):
    if sensor_type == "temperature":
        return round(random.uniform(20.0, 30.0), 2)
    elif sensor_type == "humidity":
        return round(random.uniform(30.0, 60.0), 2)
    elif sensor_type == "pressure":
        return round(random.uniform(980.0, 1020.0), 2)
    return 0.0

def publish_dummy():
    while True:
        for sensor in sensors:
            payload = {
                "guid": sensor["guid"],
                "type": sensor["type"],
                "value": str(generate_value(sensor["type"]))
            }
            publish.single(TOPIC, json.dumps(payload), hostname=BROKER, port=PORT)
            print("Published:", payload)
        time.sleep(5)

publish_dummy()
