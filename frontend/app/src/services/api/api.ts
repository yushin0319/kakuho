// app/src/services/api/api.ts
import axios from "axios";
import config from "../../config";

// APIベースURL設定
const api = axios.create({
  baseURL: config.BASE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // HttpOnly Cookie を自動送受信
});

export default api;
