import React from "react";
import { FaServer, FaDatabase, FaCloudUploadAlt, FaBell, FaTasks, FaCloud } from "react-icons/fa";

// Define node type categories
const greenTypes = ["Alert Name", "Source"];
const pinkTypes = ["Queue"];
const orangeTypes = [
  "AWS Frontend",
  "Frontend Service",
  "Ingestion",
  "Analytics",
  "Backend Service 1",
  "Backend Service II",
  "Notification Service",
];

// Map node type to icons (no icons for Alert Name and Source)
const nodeIcons = {
  "AWS Frontend": <FaCloud className="node-icon" />,
  "Frontend Service": <FaServer className="node-icon" />,
  "Ingestion": <FaCloudUploadAlt className="node-icon" />,
  "Analytics": <FaDatabase className="node-icon" />,
  "Backend Service 1": <FaServer className="node-icon" />,
  "Backend Service II": <FaServer className="node-icon" />,
  "Notification Service": <FaBell className="node-icon" />,
  "Queue": <FaTasks className="node-icon" />,
};

const FlowNode = ({ step }) => {
  let topClass = "node-top";
  if (greenTypes.includes(step.node)) topClass += " green";
  else if (pinkTypes.includes(step.node)) topClass += " pink";
  else if (orangeTypes.includes(step.node)) topClass += " orange";

  const icon = nodeIcons[step.node] || null;

  return (
    <div className="node-box" title={`${step.node}: ${step.name}`}>
      <div className={topClass}>
        {icon}
        <span>{step.node}</span>
      </div>
      <div className="node-bottom">{step.name}</div>
    </div>
  );
};

export default FlowNode;
