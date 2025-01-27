import {useState} from "react";
import Thermostat from "./Thermostat";
import Login from "./login";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [userID, setUserID] = useState("");
  const [deviceID, setDeviceID] = useState("");

  const goToThermostat=(newUserID, newDeviceId)=> {
    setUserID(newUserID);
    setDeviceID(newDeviceId);
    setPage("thermostat");
  }

  if (page === "login") {
    return (
      <div className="App">
        <Login setPage={goToThermostat} />
      </div>
    );
  }

  return (
    <div className="App">
      <Thermostat userID={userID} deviceID={deviceID}/>
    </div>
  );
}

export default App;
