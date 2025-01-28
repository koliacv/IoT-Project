# Smart Home VM Thermomerter Simulator

This project simulates a smart home temperature control system. It includes a Python-based virtual device that interacts with an MQTT broker to publish temperature updates and control a boiler based on the set temperature.

## Prerequisites

Before running the project, make sure you have the following installed:

- Python 3.7 or higher
- pip (Python package installer)

## Project Setup

### 1. Create environment
```
python -m venv venv

//On Windows:
.\venv\Scripts\activate

//On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```
pip install -r requirements.txt
```

## Description

smart-device.py was configured for "admin" user
smart-device2.py was configured for "user" user

## Running the Project

To start the vm for admin, run the Python script:
```
python smart-device.py
//or
python3 smart-device.py
```

To start the vm for user, run the Python script:
```
python smart-devic2e.py
or
python3 smart-device2.py
```

## Stopping the Project

You can stop the project at any time by pressing Ctrl+C/Control+Z in the terminal.

## MQTT and API Details
MQTT Broker: open-mqtt.visiongrid.online
MQTT Port: 1883
MQTT Topic: smarthome/temperature
API URL: https://backend.visiongrid.online
API Endpoint for Temperature: https://backend.visiongrid.online/get-temperature/{USER_ID}/{DEVICE_ID}