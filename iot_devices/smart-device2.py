import time
import threading
import json
import requests
import paho.mqtt.client as mqtt

current_temperature = 20.0
set_temperature = 16.0
boiler_on = False


API_URL = "https://backend.visiongrid.online"
USER_ID = "d1f7834a-53ea-4d40-88b0-3b1f6288859f"
DEVICE_ID = "612e469e-cf48-447f-b265-3be80e05faf1"


MQTT_BROKER = "open-mqtt.visiongrid.online"
MQTT_PORT = 1883
MQTT_TOPIC = "smarthome/temperature"

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

def on_connect(client, userdata, flags, rc):
    if rc==0:
        client.subscribe(MQTT_TOPIC)
    else:
         print(f"Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"Message received: {msg.payload.decode()}")


# publish to emqx mqtt 
def publish_temperature():
    global current_temperature
    payload = json.dumps({
        "userId": USER_ID,
        "deviceId": DEVICE_ID,
        "temperature": round(current_temperature, 1),
        "boiler_on": boiler_on
    })
    client.publish(MQTT_TOPIC, payload)
    print(f"Published: {payload}")


def activate_boiler():
    global current_temperature, boiler_on
    while True:
        if boiler_on:
            if current_temperature < set_temperature:
                current_temperature += 0.1
                time.sleep(2)
            else:
                boiler_on = False
                time.sleep(2)


# decr temp (normal state)
def decrease_temperature():
    global current_temperature
    print(boiler_on)
    while True:
        if not boiler_on:
            current_temperature -= 0.5
            print(f"DEC TEMP {current_temperature}")
        time.sleep(2)


# check set temp and adjust boiler
def temperature_control():
    global current_temperature, set_temperature, boiler_on
    while True:
        try:
            response = requests.get(f"{API_URL}/get-temperature/{USER_ID}/{DEVICE_ID}")
            if response.status_code == 200:
                data = response.json()
                set_temperature = data.get("userTemperature", set_temperature)
        except Exception as e:
            print(f"Error fetching set temperature: {e}")

        boiler_on = round(current_temperature, 1) < set_temperature
        # print(boiler_on, current_temperature, set_temperature)
        publish_temperature()
        time.sleep(2)



def start_mqtt():
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()


if __name__ == "__main__":

    threading.Thread(target=temperature_control, daemon=True).start()
    threading.Thread(target=decrease_temperature, daemon=True).start()
    threading.Thread(target=activate_boiler, daemon=True).start()

    start_mqtt()
    while True:
        time.sleep(2)

