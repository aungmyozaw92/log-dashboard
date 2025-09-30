import React from "react";
import { Spin, Card } from "antd";

const LoadingSpinner = ({ 
  size = "large", 
  tip = "Loading...", 
  style = {},
  card = false 
}) => {
  const spinner = (
    <Spin size={size} tip={tip} style={style} />
  );

  if (card) {
    return (
      <Card style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "200px",
        ...style 
      }}>
        {spinner}
      </Card>
    );
  }

  return spinner;
};

export default LoadingSpinner;
