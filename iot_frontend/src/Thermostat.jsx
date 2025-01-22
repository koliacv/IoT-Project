import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import "./Thermostat.css";

const Thermostat = (userID) => {
  const [device, setDevice] = useState("");
  const [temperature, setTemperature] = useState(20.5); // Default thermostat temperature
  const [roomTemp, setRoomTemp] = useState(18.0); // Default room temperature

  // Set this to true to show error page or loading screen.
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // const increaseTemp = () => setTemperature((prev) => Math.min(prev + 0.5, 30));
  // const decreaseTemp = () => setTemperature((prev) => Math.max(prev - 0.5, 5));

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const response = await fetch(`${API_URL}/get-temperatures/${userID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json().tempretures;
          if (data.length > 0) {
            const deviceTemp = data[0].currentTemperatures || null;
            const userTemp = data[0].userTemperature || null;
            const deviceID = data[0].deviceId || null;

            setRoomTemp(deviceTemp);
            setTemperature(userTemp);
            setDevice(deviceID);
          }
        } else {
          console.error("Failed to fetch temperatures");
        }
      } catch (error) {
        console.error("Error fetching temperatures:", error);
      }
    };

    fetchTemperatures();
  }, []);

  useEffect(() => {
    if (temperature !== null) {
      const sendTemperatureUpdate = async () => {
        try {
          const response = await fetch(`${API_URL}/set-temperature`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userID,
              deviceId: device,
              temperature,
            }),
          });

          if (!response.ok) {
            console.error("Failed to update temperature");
          }
        } catch (error) {
          console.error("Error updating temperature:", error);
        }
      };

      sendTemperatureUpdate();
    }
  }, [temperature, device]);

  // Handlers to increase and decrease temperature
  const increaseTemp = () =>
    setTemperature((prev) => Math.min(prev + 0.5, 30));

  const decreaseTemp = () =>
    setTemperature((prev) => Math.max(prev - 0.5, 5));

  if (loading) {
    return (
      <div className="thermostat-container" style={{ width: "100px" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <circle
            fill="none"
            stroke-opacity="1"
            stroke="#FF7034"
            stroke-width=".5"
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

  if (error) {
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
      <p className="status">Heating On</p>
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
      {/* /*<div className="menu">
        <button className="power">Power</button>
        <button className="manual">Manual</button>
        <button className="schedule">Schedule</button>
        <button className="setting">Settings</button>
      </div> */}
    </div>
  );
};

export default Thermostat;
