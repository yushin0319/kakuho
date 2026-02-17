// app/src/services/api/auth.ts
import { UserResponse } from "../interfaces";
import api from "./api";

// ログイン（トークンは HttpOnly Cookie にセットされる）
export const login = async (email: string, password: string): Promise<void> => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
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

// ログアウト処理（サーバー側で Cookie を削除）
export const logout = async (): Promise<void> => {
  await api.post("/logout");
};
