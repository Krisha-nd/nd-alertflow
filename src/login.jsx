import React, { useState } from "react";
import "./styles/login.css";
import backgroundImage from "./images/login-bg.jpg";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      // Store user info in localStorage
      localStorage.setItem("username", data.username);
      localStorage.setItem("name", data.name);

      // Call parent login handler if needed
      onLogin?.(data);
    } catch (err) {
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
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
