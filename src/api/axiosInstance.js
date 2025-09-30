import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = "http://localhost:8000/api/v1";

const instance = axios.create({
  baseURL: API_BASE,
});

instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
