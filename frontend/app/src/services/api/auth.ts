import api from "./api";
import { UserResponse } from "../interfaces";

// ログインしてアクセストークンを取得する関数
export const login = async (
  email: string,
  password: string
): Promise<string> => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token } = response.data;

  // トークンをlocalStorageに保存
  localStorage.setItem("token", access_token);

  return access_token;
};

// 現在のユーザー情報を取得する関数
export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

// ログアウト処理
export const logout = () => {
  localStorage.removeItem("token"); // トークンを削除してログアウト
};
