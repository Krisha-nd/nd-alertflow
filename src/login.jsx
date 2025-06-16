import React, { useState } from "react";
import "./styles/login.css";
import backgroundImage from "./images/login-bg.jpg"; // Import local background

const VALID_USERNAME = "cloud-sre";
const VALID_PASSWORD = "nd-cloud-sre";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div
      className="login-bg"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="login-card">
        <h2 className="login-title">Alert Flow Visualizer</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">
            Enter Workspace
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
