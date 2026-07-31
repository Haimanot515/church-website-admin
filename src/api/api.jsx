import axios from "axios";

const API = axios.create({
  // Same backend as the public site, no automatic Accept-Language —
  // this is the admin panel, and admin actions specify language
  // explicitly per request (via header override or request body)
  // instead of inheriting the admin's own UI language.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;