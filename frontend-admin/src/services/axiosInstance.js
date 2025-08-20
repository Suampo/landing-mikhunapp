// src/services/axiosInstance.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const API = axios.create({
  baseURL: `${API_BASE.replace(/\/+$/, "")}/api`,
  timeout: 20000,
  withCredentials: false,
});

// Adjunta token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si hay 401/403 => limpia y manda a /login
let redirecting = false;
API.interceptors.response.use(
  (r) => r,
  (err) => {
    const s = err?.response?.status;
    if ((s === 401 || s === 403) && !redirecting) {
      redirecting = true;
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default API;
