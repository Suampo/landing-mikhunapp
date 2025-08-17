// src/services/axiosInstance.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const API = axios.create({
  baseURL: API_BASE.replace(/\/+$/, "") + "/api",
  withCredentials: false,
  timeout: 20000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
