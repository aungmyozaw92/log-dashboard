import React, { useState, useEffect } from "react";
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Input, 
  Select, 
  Row, 
  Col,
  DatePicker,
  Modal,
  message,
  Tooltip,
  Badge,
  Statistic,
  Form
} from "antd";
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import StatusTag from "../components/StatusTag";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { fetchLogs, createLog, updateLog, deleteLog, enqueueLogsExport, getExportStatus, downloadExport } from "../api/logApi";
import { SEVERITIES, SOURCES } from "../constants/filters";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    severity: "",
    source: "",
    dateRange: null
  });
  const [exporting, setExporting] = useState(false);

  const levelColors = {
    ERROR: "red",
    WARNING: "orange", 
    INFO: "green",
    DEBUG: "blue"
  };

  const levelIcons = {
    ERROR: <CloseCircleOutlined />,
    WARNING: <WarningOutlined />,
    INFO: <InfoCircleOutlined />,
    DEBUG: <InfoCircleOutlined />
  };

  const getLevelColor = (severity) => levelColors[severity] || "default";
  const getLevelIcon = (severity) => levelIcons[severity] || <InfoCircleOutlined />;

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    applyFilters({ ...filters, search: value });
  };

  const handleLevelFilter = (value) => {
    setFilters(prev => ({ ...prev, severity: value }));
    applyFilters({ ...filters, severity: value });
  };

  const handleSourceFilter = (value) => {
    setFilters(prev => ({ ...prev, source: value }));
    applyFilters({ ...filters, source: value });
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
    applyFilters({ ...filters, dateRange: dates });
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...logs];

    if (currentFilters.search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        log.source.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        log.details?.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    if (currentFilters.severity) {
      filtered = filtered.filter(log => log.severity === currentFilters.severity);
    }

    if (currentFilters.source) {
      filtered = filtered.filter(log => log.source === currentFilters.source);
    }

    if (currentFilters.dateRange && currentFilters.dateRange.length === 2) {
      const [start, end] = currentFilters.dateRange;
      filtered = filtered.filter(log => {
        const logDate = dayjs(log.timestamp);
        return logDate.isAfter(start) && logDate.isBefore(end);
      });
    }

    setFilteredLogs(filtered);
  };

  const loadLogs = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const { items, total } = await fetchLogs({ limit: pageSize, offset, filters });
      setLogs(items);
      setFilteredLogs(items);
      setPagination({ current: page, pageSize, total });
    } catch (e) {
      message.error("Failed to load logs");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadLogs(pagination.current, pagination.pageSize);
    message.success("Logs refreshed!");
  };

  const handleExport = () => {
    (async () => {
      try {
        setExporting(true);
        const start = filters.dateRange?.[0]?.format?.("YYYY-MM-DD");
        const end = filters.dateRange?.[1]?.format?.("YYYY-MM-DD");
        const jobId = await enqueueLogsExport({ start, end, severity: filters.severity, source: filters.source });
        if (!jobId) {
          message.error("Failed to enqueue export");
          return;
        }
        message.loading({ content: "Export enqueued. Preparing data...", key: "export", duration: 0 });
        // poll status
        const poll = async (attempt = 0) => {
          if (attempt > 60) { // ~5 minutes if 5s interval
            message.error({ content: "Export timed out", key: "export" });
            setExporting(false);
            return;
          }
          const status = await getExportStatus(jobId);
          if (status?.status === "finished") {
            const url = downloadExport(jobId);
            window.open(url, "_blank");
            message.success({ content: "CSV ready. Download started.", key: "export" });
            setExporting(false);
          } else if (status?.status === "failed") {
            message.error({ content: "Export failed", key: "export" });
            setExporting(false);
          } else {
            const text = status?.status === "started" ? "Export running..." : "Waiting for worker...";
            message.loading({ content: text, key: "export", duration: 0 });
            setTimeout(() => poll(attempt + 1), 5000);
          }
        };
        poll();
      } catch (e) {
        console.error(e);
        message.error({ content: "Failed to start export", key: "export" });
      } finally {
        // exporting state will be reset on finish/fail/timeout
      }
    })();
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const getLogStats = () => {
    const total = filteredLogs.length;
    const errors = filteredLogs.filter(log => log.severity === "ERROR").length;
    const warnings = filteredLogs.filter(log => log.severity === "WARNING").length;
    const info = filteredLogs.filter(log => log.severity === "INFO").length;
    
    return { total, errors, warnings, info };
  };

  const stats = getLogStats();

  const columns = [
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (severity) => (
        <StatusTag status={severity} type="severity" />
      ),
      filters: [
        { text: "ERROR", value: "ERROR" },
        { text: "WARNING", value: "WARNING" },
        { text: "INFO", value: "INFO" },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.details && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.details}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: (source) => <Tag color="blue">{source}</Tag>,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp) => (
        <div>
          <div>{dayjs(timestamp).format("YYYY-MM-DD")}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(timestamp).format("HH:mm:ss")}
          </Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
  
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => showLogDetails(record)}
            />
          </Tooltip>
          <Button 
            size="small"
            onClick={() => {
              setSelectedLog(record);
              editForm.setFieldsValue(record);
              setIsEditModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            danger
            onClick={async () => {
              try {
                setLoading(true);
                const ok = await deleteLog(record.id);
                if (ok) {
                  message.success("Log deleted successfully");
                  await loadLogs(pagination.current, pagination.pageSize);
                } else {
                  message.error("Failed to delete log");
                }
              } catch (e) {
                message.error("Failed to delete log");
              } finally {
                setLoading(false);
              }
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Log Management"
        subtitle="Monitor and analyze system logs"
        actions={
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary"
              onClick={() => {
                setSelectedLog(null);
                createForm.resetFields();
                setIsEditModalVisible(true);
              }}
            >
              New Log
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              disabled={exporting}
            >
              Export
            </Button>
          </Space>
        }
      />

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Search logs..."
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Severity"
              style={{ width: "100%" }}
              onChange={handleLevelFilter}
              allowClear
            >
              {SEVERITIES.map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Source"
              style={{ width: "100%" }}
              onChange={handleSourceFilter}
              allowClear
            >
              {SOURCES.map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={handleDateRangeChange}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({ search: "", severity: "", source: "", dateRange: null });
                setFilteredLogs(logs);
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => loadLogs(page, pageSize),
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Log Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Severity:</Text>
                <div>
                  <Tag 
                    color={getLevelColor(selectedLog.severity)} 
                    icon={getLevelIcon(selectedLog.severity)}
                    style={{ fontWeight: "bold" }}
                  >
                    {selectedLog.severity}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Source:</Text>
                <div>
                  <Tag color="blue">{selectedLog.source}</Tag>
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Message:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text>{selectedLog.message}</Text>
                </div>
              </Col>
              {selectedLog.details && (
                <Col span={24}>
                  <Text strong>Details:</Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">{selectedLog.details}</Text>
                  </div>
                </Col>
              )}
              <Col span={12}>
                <Text strong>Timestamp:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text>{dayjs(selectedLog.timestamp).format("YYYY-MM-DD HH:mm:ss")}</Text>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>IP Address:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text>{selectedLog.ip_address}</Text>
                </div>
              </Col>
              {selectedLog.user_id && (
                <Col span={12}>
                  <Text strong>User ID:</Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text>{selectedLog.user_id}</Text>
                  </div>
                </Col>
              )}
              {selectedLog.stack_trace && (
                <Col span={24}>
                  <Text strong>Stack Trace:</Text>
                  <div style={{ 
                    marginTop: "8px", 
                    backgroundColor: "#f5f5f5", 
                    padding: "12px", 
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap"
                  }}>
                    <Text>{selectedLog.stack_trace}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        title={isEditModalVisible ? "Edit Log" : "Create Log"}
        open={isEditModalVisible}
        destroyOnClose
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          createForm.resetFields();
        }}
        onOk={async () => {
          try {
            const form = selectedLog ? editForm : createForm;
            const values = await form.validateFields();
            if (selectedLog) {
              await updateLog(selectedLog.id, values);
              message.success("Log updated successfully");
            } else {
              await createLog(values);
              message.success("Log created successfully");
            }
            setIsEditModalVisible(false);
            setSelectedLog(null);
            editForm.resetFields();
            createForm.resetFields();
            loadLogs(pagination.current, pagination.pageSize);
          } catch (e) {
            message.error("Failed to save log");
          }
        }}
      >
        <Form layout="vertical" form={selectedLog ? editForm : createForm} initialValues={selectedLog || {}} preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
                <Select placeholder="Select severity">
                  {SEVERITIES.map(s => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="source" label="Source" rules={[{ required: true }]}>
                <Select placeholder="Select source">
                  {SOURCES.map(s => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Enter log message" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LogList;
