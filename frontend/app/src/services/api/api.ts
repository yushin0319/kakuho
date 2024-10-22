import axios from "axios";

// APIベースURL設定
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/", // バックエンドのベースURL
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
