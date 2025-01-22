import time
import threading
import requests
import paho.mqtt.client as mqtt
from flask import Flask, jsonify, request


app = Flask(__name__)


current_temperature = 22.0
set_temperature = 20.0
boiler_on = False


API_URL = "http://example.com/api"
USER_ID = "test-user"
DEVICE_ID = "test-device"


MQTT_BROKER = "mqtt.eclipse.org"
MQTT_PORT = 1883
MQTT_TOPIC = "smarthome/temperature"

client = mqtt.Client()

# send curr temp
def send_temperature_to_api():
    global current_temperature
    data = {
        "userId": USER_ID,
        "deviceId": DEVICE_ID,
        "temperature": current_temperature
    }
    try:
        response = requests.put(f"{API_URL}/set-temperature", json=data)
        if response.status_code == 200:
            print(f"Temperature set to {current_temperature:.1f}")
        else:
            print(f"Error setting temperature: {response.status_code}")
    except Exception as e:
        print(f"Error sending temperature to API: {e}")

def activate_boiler():
    global current_temperature, boiler_on
    while True:
        if boiler_on:
            current_temperature += 0.5
            send_temperature_to_api()
            time.sleep(2)  
        else:
            time.sleep(0.1) 

# decr temp (normal state)
def decrease_temperature():
    global current_temperature
    while True:
        if not boiler_on:
            current_temperature -= 0.1
        time.sleep(1) 

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

        if current_temperature < set_temperature:
            boiler_on = True
        else:
            boiler_on = False

        client.publish(MQTT_TOPIC, f"Current Temperature: {current_temperature:.1f}, Boiler On: {boiler_on}")
        time.sleep(1)  


@app.route("/get_current_temperature", methods=["GET"])
def get_current_temperature():
    return jsonify({
        "current_temperature": current_temperature,
        "user_id": USER_ID
    })


def start_mqtt():
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

if __name__ == "__main__":
   
    threading.Thread(target=decrease_temperature, daemon=True).start()
    threading.Thread(target=activate_boiler, daemon=True).start()
    threading.Thread(target=temperature_control, daemon=True).start()

    start_mqtt()

    app.run(host="0.0.0.0", port=5000)
