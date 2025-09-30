import React from "react";
import { Empty, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const EmptyState = ({ 
  title = "No data", 
  description = "There are no items to display",
  actionText = "Add New",
  onAction,
  icon,
  image
}) => {
  return (
    <Empty
      image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      imageStyle={{ height: 60 }}
      icon={icon}
      description={
        <div>
          <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
            {title}
          </div>
          <div style={{ color: "#666" }}>
            {description}
          </div>
        </div>
      }
    >
      {onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;
