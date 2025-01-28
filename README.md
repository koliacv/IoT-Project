# IoT-Project

## Business Outline

The Smart Home system is designed to provide increased comfort, control, and energy efficiency through IoT technology. The system integrates a network of smart devices that communicate with a  backend to automate and optimize household tasks. This project is designed to allow users to remotely monitor and control the temperature of their homes via a web interface. With simple setup, users can manage their home tempreture anywhere via a website, thereby improving their living experience by reducing utility costs.

With this system, users can log in to a web portal and control their devices, adjusting the temperature remotely and receiving real-time updates on the current conditions. A REST API handles the requests and logic, ensuring seamless integration between devices, the cloud, and user interfaces.

## Main Components and Properties

### Real-time Monitoring and Analysis
Users can log into a web interface to view these measurements in real-time and adjust the set temperature for their respective homes. The smart devices will automatically adjust the temperature to meet the set point, using a "boiler" function when the temperature falls below the desired value.

### Remote Control and Automation
The system allows users to control heaters remotely via a secure connection. This function helps homeowners save energy by turning off appliances when not in use and adjusting settings like lights or the thermostat before arriving home. 

### IoT Devices Communication
The system employs an MQTT broker to facilitate communication between the devices and the web interface. The Python-based IoT device on the VM publishes temperature data to the broker, which the web interface can subscribe to, enabling live data updates. Users can remotely control the devices by sending commands through the web interface, and these commands are passed on to the corresponding IoT devices.

### REST API for Set Temperature Management
The system uses a REST API to allow the IoT devices to fetch the set temperature for the user's home from the backend. This ensures that the devices are always aligned with the user's preferences.

### Two Virtual Machines (VMs) and Users
The system involves two VMs, each representing a smart device connected to the cloud. Users can log into their respective accounts, manage their devices, and monitor real-time data.

## How It Works

1. **User Authentication and Control:**
   - Users log in to the web portal using their credentials.
   - They can view the current temperature of their respective devices and modify the set temperature.
   - The system continuously publishes the current temperature and device status to an MQTT topic, which the web interface subscribes to for live updates.

2. **Device Control via MQTT:**
   - The Python-based IoT device running on the VM continuously monitors and controls the temperature by adjusting the state of a virtual boiler (which increases the temperature).
   - The device publishes updates to the MQTT broker, which are consumed by the web interface, showing real-time temperature changes.

3. **Temperature Regulation:**
   - When the temperature is lower than the set temperature, the system activates the boiler to heat the room.
   - Once the set temperature is achieved, the system stops the boiler, ensuring energy efficiency.

## Python Virtual Machine (VM) Functionality

The Python VM is responsible for simulating the smart device that controls the temperature. Here are the key tasks the Python VM performs:

- **Temperature Monitoring and Control:** The Python VM monitors the temperature and compares it to the set temperature. It activates the boiler when necessary to reach the desired temperature.
- **Publishing to MQTT:** The device publishes real-time temperature data and the status of the boiler to the MQTT broker, allowing the web interface to stay updated.
- **Fetching Set Temperature:** The Python VM periodically checks the backend API for any changes to the set temperature, adjusting its behavior accordingly.


## User Stories

1. **Remote Control of Temperature:**
   *As a user, I want to control the temperature of my device remotely, so that I can maintain a comfortable environment from anywhere.*

2. **Energy-Saving Temperature Control:**
   *As a user, I want my device to automatically adjust the temperature to the set point, helping me save energy and reduce costs.*

3. **Real-Time Temperature Monitoring:**
   *As a user, I want to see the current temperature of my device in real-time on the web interface so that I can make informed decisions.*

4. **Device Status Alerts:**
   *As a user, I want to receive alerts when the device's status changes (e.g., when the boiler is turned on or off), so that I can be informed about my home’s temperature regulation.*

5. **Multiple Device Management:**
   *As a homeowner, I want to manage multiple devices in my smart home, each with its own set temperature and control options.*

6. **User-Specific Access Control:**
   *As an administrator, I want to manage access to different devices so that I can assign control over specific devices to different users in my household.*
