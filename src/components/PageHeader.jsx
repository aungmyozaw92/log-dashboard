import React from "react";
import { Typography, Space, Button } from "antd";

const { Title } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  extra,
  style = {}
}) => {
  return (
    <div 
      style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        marginBottom: "24px",
        ...style 
      }}
    >
      <div>
        <Title level={2} style={{ margin: 0, marginBottom: subtitle ? "4px" : 0 }}>
          {title}
        </Title>
        {subtitle && (
          <div style={{ color: "#666", fontSize: "14px" }}>
            {subtitle}
          </div>
        )}
      </div>
      
      {(actions || extra) && (
        <Space>
          {actions}
          {extra}
        </Space>
      )}
    </div>
  );
};

export default PageHeader;
