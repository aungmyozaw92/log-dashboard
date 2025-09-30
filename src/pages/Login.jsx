import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Space } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/logApi";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi({
        username: values.username,
        password: values.password,
      });

      if (res.success) {
        login(res.data.user, res.data.token.access_token);
        message.success("Login successful!");
        navigate("/");
      } else {
        message.error(res.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Login error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    >
      <Card 
        style={{ 
          width: 400, 
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: "12px"
        }}
        bodyStyle={{ padding: "40px" }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <LoginOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }} />
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Welcome Back
            </Title>
            <Text type="secondary">Sign in to your account</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter your username"
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Enter your password"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block
                size="large"
                style={{ height: "48px", fontSize: "16px" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
