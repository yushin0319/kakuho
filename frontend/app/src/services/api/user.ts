// app/src/services/api/user.ts
import { UserCreate, UserResponse, UserUpdate } from "../interfaces";
import api from "./api";
import { handleApiRequest } from "./utils";

// 1. ユーザーを新規作成（サインアップ）
export const signupUser = async (data: UserCreate): Promise<UserResponse> => {
  return handleApiRequest(api.post("/signup", data));
};

// 2. 単一のユーザーを取得
export const fetchUser = async (userId: number): Promise<UserResponse> => {
  return handleApiRequest(api.get(`/users/${userId}`));
};

// 3. ユーザーの一覧を取得（管理者のみ）
export const fetchUsers = async (): Promise<UserResponse[]> => {
  return handleApiRequest(api.get("/users"));
};

// 4. ユーザー情報を更新（管理者またはユーザー本人のみ）
export const updateUser = async (
  userId: number,
  data: UserUpdate
): Promise<UserResponse> => {
  return handleApiRequest(api.put(`/users/${userId}`, data));
};

// 5. ユーザーを削除（管理者のみ）
export const deleteUser = async (userId: number): Promise<void> => {
  return handleApiRequest(api.delete(`/users/${userId}`));
};
