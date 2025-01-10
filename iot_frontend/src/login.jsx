// Import necessary libraries
import React, { useState } from "react";
import "./App.css"; // Optional: Add your CSS styling here

// Main Login Component
const Login = ({ setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple validation
    if (username === "" || password === "") {
      setError("Username and password cannot be empty.");
      return;
    }

    // Dummy check for username and password
    if (username === "admin" && password === "123456") {
      setPage("thermostat");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <h2>Temperature Checker Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button style={{width:'auto'}} type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
