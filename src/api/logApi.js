import axios from "./axiosInstance";

// Auth API
export const login = async (credentials) => {
  const form = new URLSearchParams();
  if (credentials?.username) form.append("username", credentials.username);
  if (credentials?.password) form.append("password", credentials.password);
  const response = await axios.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post("/auth/logout");
  return response.data;
};

// Logs API
export const fetchLogs = async ({ limit = 20, offset = 0, filters } = {}) => {
  const { dateRange, severity, source } = filters || {};
  const params = {
    severity,
    source,
    start: dateRange?.[0] || undefined,
    end: dateRange?.[1] || undefined,
    limit,
    offset,
  };
  const res = await axios.get("/logs", { params });
  const data = res.data?.data || {};
  return { items: data.logs || [], total: data.total || 0 };
};

export const fetchLogById = async (id) => {
  const response = await axios.get(`/logs/${id}`);
  return response.data?.data?.log;
};

export const createLog = async (logData) => {
  const response = await axios.post("/logs", logData);
  return response.data?.data?.log;
};

export const updateLog = async (id, logData) => {
  const response = await axios.patch(`/logs/${id}`, logData);
  return response.data?.data?.log;
};

export const deleteLog = async (id) => {
  const response = await axios.delete(`/logs/${id}`);
  return response.data?.success === true;
};

// Users API
export const getUsers = async (params = {}) => {
  const mapped = {
    search: params.search ?? undefined,
    status: params.status ?? undefined,
    role_admin: params.role_admin ?? params.role ?? undefined,
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  };
  const response = await axios.get("/users", { params: mapped });
  return response.data?.data?.users ?? [];
};

export const fetchUserById = async (id) => {
  const response = await axios.get(`/users/${id}`);
  return response.data?.data?.user;
};

export const createUser = async (userData) => {
  const payload = {
    username: userData.username,
    password: userData.password,
    name: userData.name,
    email: userData.email,
  };
  const response = await axios.post("/users", payload);
  return response.data?.data?.user;
};

export const updateUser = async (id, userData) => {
  const payload = {
    name: userData.name,
    email: userData.email,
    is_active: userData.is_active,
    is_admin: userData.is_admin,
  };
  const response = await axios.patch(`/users/${id}`, payload);
  return response.data?.data?.user;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`/users/${id}`);
  return response.data?.success === true;
};

// Dashboard API
export const fetchDashboardStats = async () => {
  const response = await axios.get("/dashboard/stats");
  return response.data;
};

export const fetchRecentLogs = async (limit = 10) => {
  const response = await axios.get(`/logs/recent?limit=${limit}`);
  return response.data;
};

// Aggregation API
export const fetchLogAggregation = async (by, { start, end, severity, source } = {}) => {
  const params = {
    start: start || undefined,
    end: end || undefined,
    severity: severity || undefined,
    source: source || undefined,
  };
  const res = await axios.get(`/logs/aggregate/by/${by}`, { params });
  return res.data?.data?.aggregation?.buckets || [];
};

// Export API
export const enqueueLogsExport = async ({ start, end, severity, source } = {}) => {
  const params = {
    start: start || undefined,
    end: end || undefined,
    severity: severity || undefined,
    source: source || undefined,
  };
  const res = await axios.post(`/logs/export`, null, { params });
  return res.data?.data?.job_id;
};

export const getExportStatus = async (jobId) => {
  const res = await axios.get(`/logs/export/${jobId}`);
  return res.data?.data; // { status, path? }
};

export const downloadExport = (jobId) => {
  // return a URL to open in a new tab
  return `${axios.defaults.baseURL}/logs/export/${jobId}/download`;
};
