import { useState, useEffect } from "react";
import mqtt from "mqtt";
import { API_URL, BROKER_URL } from "../config";
import "./Thermostat.css";

// eslint-disable-next-line react/prop-types
const Thermostat = ({ userID, deviceID }) => {
  const [boilerOn, setBoilerOn] = useState(false);
  const [temperature, setTemperature] = useState(20.5); // Default thermostat temperature
  const [roomTemp, setRoomTemp] = useState(18.0); // Default room temperature
  const topic = "smarthome/temperature";

  // Set this to true to show error page or loading screen.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const response = await fetch(
          `${API_URL}/get-temperature/${userID}/${deviceID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const deviceTemp = data.currentTemperature || null;
          const userTemp = data.userTemperature || null;

          setRoomTemp(deviceTemp);
          setTemperature(userTemp);
        } else {
          console.error("Failed to fetch temperatures");
        }
      } catch (err) {
        console.error("Error fetching temperatures:", err);
      }
    };

    fetchTemperatures();
  }, []);

  useEffect(() => {
    // MQTT client
    const client = mqtt.connect(BROKER_URL, {
      reconnectPeriod: 1000,
    });
    //client connects
    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const { userId, deviceId, temperature: temp, boiler_on } = parsedMessage;
        if (userId === userID && deviceId === deviceID) {
          // console.log(`Message for ${userId}, ${deviceId}: ${temp}°C; Heating ${boilerOn ? "On" : "Off"}`);
          setRoomTemp(temp);
          setBoilerOn(boiler_on);
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    });
    return () => {
      client.end();
      console.log("Disconnected from MQTT broker");
    };
  }, []);

  const sendTemperatureUpdate = async (thisTemp) => {
    if (temperature !== null && deviceID !== null) {
      try {
        const response = await fetch(`${API_URL}/set-temperature`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userID,
            deviceId: deviceID,
            temperature: thisTemp,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update temperature");
        }
      } catch (error) {
        console.error("Error updating temperature:", error);
      }
    }
  };

  // Handlers to increase and decrease temperature
  const increaseTemp = () => {
    const thisTemp = temperature >=30 ? temperature : temperature + 0.5;
    setTemperature(thisTemp);
    sendTemperatureUpdate(thisTemp);
  };

  const decreaseTemp = () => {
    const thisTemp = temperature <=5 ? temperature : temperature - 0.5;
    setTemperature(thisTemp);
    sendTemperatureUpdate(thisTemp);
  };

  if (loading) {
    return (
      <div className="thermostat-container" style={{ width: "100px" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle
            fill="none"
            // stroke-opacity="1"
            stroke="#FF7034"
            // stroke-width=".5"
            cx="100"
            cy="100"
            r="0"
          >
            <animate
              attributeName="r"
              calcMode="spline"
              dur="2"
              values="1;80"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="stroke-width"
              calcMode="spline"
              dur="2"
              values="0;25"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
            <animate
              attributeName="stroke-opacity"
              calcMode="spline"
              dur="2"
              values="1;0"
              keyTimes="0;1"
              keySplines="0 .2 .5 1"
              repeatCount="indefinite"
            ></animate>
          </circle>
        </svg>
      </div>
    );
  }

  if (!deviceID) {
    return (
      <div className="thermostat-container">
        <h1>Error</h1>
        <p className="status">Device not found</p>
      </div>
    );
  }

  return (
    <div className="thermostat-container">
      <h1>Thermostat</h1>
      <p className="status">Heating {boilerOn ? "On" : "Off"}</p>
      <div className="circle">
        <div className="temperature">
          <h2>{temperature}°C</h2>
          <p>Room Temp. {roomTemp}°C</p>
        </div>
        <div className="controls">
          <button
            style={{ padding: "0", marginRight: "4px" }}
            onClick={decreaseTemp}
          >
            ▼
          </button>
          <button style={{ padding: "0" }} onClick={increaseTemp}>
            ▲
          </button>
        </div>
      </div>
    </div>
  );
};

export default Thermostat;
