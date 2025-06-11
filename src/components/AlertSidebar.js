import React, { useState } from "react";
import alertData from "../data/alert.json";
import "../styles/AlertSidebar.css";

const OSS_ALERTS_RED = [
  "DRIVER DISTRACTION", "FOLLOWING DISTANCE", "SEATBELT COMPILANCE",
  "SIGN VIOLATIONS", "TRAFFIC LIGHT VIOLATION", "U-TURN",
];

const OSS_ALERTS_GREEN = [
  "HARD BRAKING", "HARD ACCELERATION", "CAMERA OBSTRUCTION",
  "WEAVING", "HARD TURN", "DRIVER-STAR",
];

const SIMILAR_ALERTS_PINK = [
  "HARD BRAKING", "HARD ACCELERATION", "TRAFFIC LIGHT VIOLATION", "HARD TURN", "RELATIVE SPEEDING",
  "SIGN VIOLATIONS", "SEATBELT COMPILANCE", "COLLISION WARNING", "WEAVING", "U-TURN",
  "ERROR EVENTS", "DRIVER DROWSINESS", "DRIVER-STAR", "RAILROAD CROSSING", "DRIVER DISTRACTION",
  "SWERVE", "CAMERA OBSTRUTION", "NO TRUCKS SIGN VIOLATIONS", "FACE MASK COMPILANCE", "LOW IMPACT",
  "DRIVER DISTRACTED + TRAFFIC LIGHTS", "DRIVER DISTRACTED + STOP SIGN", "SPEEDING + TRAFFIC LIGHTS",
  "TRAFFIC LIGHTS + HARD TURN", "DRIVER DISTRACTED + HARD BRAKE", "DRIVER DISTRACTED + HARD TURN",
  "SPEEDING + HARD BRAKE", "SPEEDING + HARD TURN", "FOLLOWING DISTANCE + HARD BRAKE",
  "HARD BRAKE + HARD TURN", "DRIVER DISTRACTED + FOLLOWING DISTANCE", "DRIVER DISTRACTED + SPEEDING",
  "DRIVER DISTRACTED + WEAVING", "SPEEDING + FOLLOWING DISTANCE", "SPEEDING + WEAVING", "BACKING",
  "UNSECURE PACKAGES", "SMOKING", "ROADSIDE PARKING", "FUEL IMPACT", "LANE CONDUCT", "UNAUTHORIZED DRIVER",
  "Driver Distracted + Following Distance"
];

const SPECIAL_SIMILAR_ALERTS = {
  1: "red-alert",
  9: "green-alert",
  4: "yellow-alert",
  11: "blue-alert",
  42: "orange-alert",
};

const AlertSidebar = ({ onSelectAlert, selectedAlertId }) => {
  const [search, setSearch] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [ossChecked, setOssChecked] = useState(false);
  const [similarChecked, setSimilarChecked] = useState(false);

  const toggleFilterOptions = () => {
    setShowFilterOptions((prev) => !prev);
  };

  const handleOssToggle = () => {
    setOssChecked(!ossChecked);
    if (!ossChecked) setSimilarChecked(false);
  };

  const handleSimilarToggle = () => {
    setSimilarChecked(!similarChecked);
    if (!similarChecked) setOssChecked(false);
  };

  const getColorClass = (alert) => {
    const name = alert.name.toUpperCase();

    if (ossChecked) {
      if (OSS_ALERTS_RED.includes(name)) return "oss-red-alert";
      if (OSS_ALERTS_GREEN.includes(name)) return "oss-green-alert";
    }

    if (similarChecked) {
      if (SIMILAR_ALERTS_PINK.includes(name)) return "similar-pink-alert";
      if (SPECIAL_SIMILAR_ALERTS[alert.id]) return SPECIAL_SIMILAR_ALERTS[alert.id];
    }

    return "";
  };

  const filteredAlerts = alertData.alerts.filter((alert) =>
    alert.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="alert-sidebar">
      <input
        type="text"
        placeholder="Search Alerts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <div className="filter-toggle" onClick={toggleFilterOptions}>
        Filter
      </div>

      {showFilterOptions && (
        <div className="filters">
          <label>
            <input
              type="checkbox"
              checked={ossChecked}
              onChange={handleOssToggle}
            />
            <span className="oss-label">OSS</span>
          </label>
          <label style={{ marginLeft: "12px" }}>
            <input
              type="checkbox"
              checked={similarChecked}
              onChange={handleSimilarToggle}
            />
            <span className="oss-label">Similar Alerts</span>
          </label>
        </div>
      )}

      <ul className="alert-list">
        {filteredAlerts.map((alert) => (
          <li
            key={alert.id}
            className={`alert-item ${selectedAlertId === alert.id ? "selected" : ""} ${getColorClass(alert)}`}
            onClick={() => onSelectAlert(alert.id)}
          >
            <span className="alert-id">{alert.id}.</span>
            <span className="alert-name">{alert.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertSidebar;