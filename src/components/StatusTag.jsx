import React from "react";
import { Tag } from "antd";

const StatusTag = ({ status, type = "status" }) => {
  const getStatusConfig = (status, type) => {
    if (type === "status") {
      switch (status) {
        case true:
        case "active":
        case "online":
          return { color: "green", text: "Active" };
        case false:
        case "inactive":
        case "offline":
          return { color: "red", text: "Inactive" };
        default:
          return { color: "default", text: status };
      }
    }
    
    if (type === "level" || type === "severity") {
      switch (status) {
        case "ERROR":
          return { color: "red", text: "ERROR" };
        case "WARNING":
          return { color: "orange", text: "WARNING" };
        case "INFO":
          return { color: "green", text: "INFO" };
        case "DEBUG":
          return { color: "blue", text: "DEBUG" };
        default:
          return { color: "default", text: status };
      }
    }
    
    if (type === "role") {
      switch (status) {
        case true:
        case "admin":
          return { color: "red", text: "Admin" };
        case false:
        case "user":
          return { color: "blue", text: "User" };
        default:
          return { color: "default", text: status };
      }
    }
    
    return { color: "default", text: status };
  };

  const config = getStatusConfig(status, type);

  return (
    <Tag color={config.color}>
      {config.text}
    </Tag>
  );
};

export default StatusTag;
