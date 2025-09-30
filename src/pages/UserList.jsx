import React, { useState, useEffect } from "react";
import {
  Table, Card, Button, Space, Avatar, Typography, Input, Select,
  Row, Col, Modal, Form, message, Popconfirm, Tooltip
} from "antd";
import {
  UserOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, EyeOutlined, UserAddOutlined
} from "@ant-design/icons";
import StatusTag from "../components/StatusTag";
import PageHeader from "../components/PageHeader";
import { getUsers, createUser, updateUser, deleteUser } from "../api/logApi";

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const UserList = () => {
  const [msg, contextHolder] = message.useMessage();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const list = await getUsers();
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      msg.error("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.username.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    setIsModalVisible(true);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const key = "userSave";
      msg.loading({ key, content: editingUser ? "Updating user..." : "Creating user...", duration: 0 });
      if (editingUser) {
        await updateUser(editingUser.id, values);
        msg.success({ key, content: "User updated successfully!" });
      } else {
        await createUser(values);
        msg.success({ key, content: "User created successfully!" });
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // reload data
    } catch (error) {
      console.error(error);
      msg.error({ key: "userSave", content: "Failed to save user" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      const key = "userDelete";
      msg.loading({ key, content: "Deleting user...", duration: 0 });
      await deleteUser(userId);
      msg.success({ key, content: "User deleted successfully!" });
      fetchUsers();
    } catch (error) {
      msg.error({ key: "userDelete", content: "Failed to delete user" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{ backgroundColor: record.is_active ? '#1890ff' : '#d9d9d9' }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      key: "role",
      render: (_, record) => <StatusTag status={record.is_admin} type="role" />,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => <StatusTag status={record.is_active} type="status" />,
    },
    
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete User">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="User Management"
        subtitle="Manage system users and their permissions"
        actions={
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => showModal()}>
            Add User
          </Button>
        }
      />

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search users..."
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}> 
                <Input placeholder="Enter username" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}> 
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}> 
              <Input.Password placeholder="Enter password (min 8 chars)" />
            </Form.Item>
          )}
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}> 
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_active" label="Status"> 
                <Select>
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_admin" label="Role"> 
                <Select>
                  <Option value={false}>User</Option>
                  <Option value={true}>Admin</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
