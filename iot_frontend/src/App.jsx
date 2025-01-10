import React, {useState} from "react";
import Thermostat from "./Thermostat";
import Login from "./login";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");

  if (page === "login") {
    return (
      <div className="App">
        <Login setPage={setPage} />
      </div>
    );
  }

  return (
    <div className="App">
      <Thermostat />
    </div>
  );
}

export default App;
