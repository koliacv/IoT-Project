import React, {useState} from "react";
import Thermostat from "./Thermostat";
import Login from "./login";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [userID, setUserID] = useState("");

  const goToThermostat=(newUserID)=> {
    setUserID(newUserID);
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
      <Thermostat userID={userID}/>
    </div>
  );
}

export default App;
