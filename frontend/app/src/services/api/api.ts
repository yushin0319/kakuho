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
});

// リクエスト前にトークンをヘッダーに付与するインターセプター設定
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 保存されたトークンを取得
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // トークンをヘッダーに付与
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
