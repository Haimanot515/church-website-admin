import axios from "axios";
import i18n from "../i18n";

const API = axios.create({
  // This uses the Render URL in production and localhost during development
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = i18n.language || "en";

  return config;
});

export default API;