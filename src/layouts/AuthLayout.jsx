import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useAuthStore } from "../store/useAuthStore";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AuthLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/logs",
      icon: <FileTextOutlined />,
      label: <Link to="/logs">Logs</Link>,
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: "#001529",
        }}
      >
        <div style={{ 
          height: "64px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <Text 
            strong 
            style={{ 
              color: "#fff", 
              fontSize: collapsed ? "16px" : "18px",
              whiteSpace: "nowrap",
              overflow: "hidden"
            }}
          >
            {collapsed ? "LD" : "Log Dashboard"}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            padding: "0 24px", 
            background: "#fff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          
          <Space>
            <Text strong>Welcome, {user?.name || user?.username}</Text>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar 
                size={40} 
                icon={<UserOutlined />}
                style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content 
          style={{ 
            margin: "24px 16px", 
            padding: "24px", 
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AuthLayout;
