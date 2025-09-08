// src/utils/api.js
import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

export default api;
export { api };
