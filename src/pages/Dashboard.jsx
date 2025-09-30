import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Typography, Space, Tag, DatePicker, Select, Button, message } from "antd";
import { 
  UserOutlined, 
  FileTextOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import StatusTag from "../components/StatusTag";
import PageHeader from "../components/PageHeader";
import dayjs from "dayjs";
import { SEVERITIES, SOURCES } from "../constants/filters";
import { fetchLogs, fetchLogAggregation } from "../api/logApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  // Filters state
  const [range, setRange] = useState([dayjs().subtract(7, "day"), dayjs()]);
  const [severity, setSeverity] = useState();
  const [source, setSource] = useState();
  // Data state
  const [loading, setLoading] = useState(false);
  const [dist, setDist] = useState([]); // [{key,count}]
  const [trend, setTrend] = useState([]); // [{date,count}]
  const [recentLogs, setRecentLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const colorMap = useMemo(() => ({
    INFO: "#52c41a",
    WARNING: "#faad14",
    ERROR: "#ff4d4f",
    DEBUG: "#1677ff",
  }), []);

  const loadData = async () => {
    try {
      setLoading(true);
      const start = range?.[0]?.format("YYYY-MM-DD");
      const end = range?.[1]?.format("YYYY-MM-DD");
      // Distribution by severity from backend (normalize WARN -> WARNING)
      const buckets = await fetchLogAggregation("severity", { start, end, severity, source });
      const normMap = buckets.reduce((acc, b) => {
        const key = b.key === "WARN" ? "WARNING" : b.key;
        acc[key] = (acc[key] || 0) + (b.count || 0);
        return acc;
      }, {});
      const normalizedList = SEVERITIES.map(sev => ({ key: sev, count: normMap[sev] || 0 }));
      setDist(normalizedList);
      // Fetch logs within range to build trend per day across ALL pages
      const pageSize = 500;
      let all = [];
      const first = await fetchLogs({ limit: pageSize, offset: 0, filters: { dateRange: [start, end], severity, source } });
      all = all.concat(first.items);
      const total = first.total || 0;
      // paginate while under a safe cap
      const cap = 5000;
      for (let offset = pageSize; offset < Math.min(total, cap); offset += pageSize) {
        // eslint-disable-next-line no-await-in-loop
        const next = await fetchLogs({ limit: pageSize, offset, filters: { dateRange: [start, end], severity, source } });
        all = all.concat(next.items);
      }
      setRecentLogs(all.slice(0, 5));
      setTotalCount(total);
      // Build trend counts per day per severity
      const counts = {};
      all.forEach(l => {
        const d = dayjs(l.timestamp).format("YYYY-MM-DD");
        const sev = l.severity;
        counts[d] = counts[d] || { ERROR: 0, WARNING: 0, WARN: 0, INFO: 0, DEBUG: 0 };
        if (sev in counts[d]) counts[d][sev] += 1; else counts[d][sev] = 1;
      });
      const sortedDates = Object.keys(counts).sort();
      setTrend(sortedDates.map(d => ({ date: d, ...counts[d], WARNING: counts[d].WARNING || counts[d].WARN || 0 })));
      message.success("Dashboard updated");
    } catch (e) {
      console.error(e);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor system performance and activity"
        actions={
          <Space>
            <RangePicker value={range} onChange={setRange} />
            <Select
              allowClear
              placeholder="Severity"
              style={{ width: 140 }}
              value={severity}
              onChange={setSeverity}
            >
              {SEVERITIES.map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
            <Select
              allowClear
              placeholder="Source"
              style={{ width: 160 }}
              value={source}
              onChange={setSource}
            >
              {SOURCES.map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
            <Button type="primary" loading={loading} onClick={loadData}>Apply</Button>
          </Space>
        }
      />

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Logs"
              value={totalCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Errors"
              value={(dist.find(b => b.key === "ERROR")?.count) || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Info"
              value={(dist.find(b => b.key === "INFO")?.count) || 0}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Warnings"
              value={(dist.find(b => b.key === "WARNING")?.count) || (dist.find(b => b.key === "WARN")?.count) || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Debug"
              value={(dist.find(b => b.key === "DEBUG")?.count) || 0}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Log Trend" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ERROR" stroke={colorMap.ERROR} strokeWidth={2} name="ERROR" />
                <Line type="monotone" dataKey="WARNING" stroke={colorMap.WARNING} strokeWidth={2} name="WARNING" />
                <Line type="monotone" dataKey="INFO" stroke={colorMap.INFO} strokeWidth={2} name="INFO" />
                <Line type="monotone" dataKey="DEBUG" stroke={colorMap.DEBUG} strokeWidth={2} name="DEBUG" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Log Distribution (Histogram)" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dist.map(b => ({ name: b.key, count: b.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMap[entry.key] || "#999"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Logs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Logs" extra={<Text type="secondary">Last 5 entries</Text>}>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {recentLogs.map((log) => (
                <Card key={log.id} size="small" style={{ marginBottom: "8px" }}>
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                      <StatusTag status={log.severity} type="severity" />
                      <Text>{log.message}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {log.source}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                      </Text>
                    </Space>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
        
      </Row>
    </div>
  );
};

export default Dashboard;