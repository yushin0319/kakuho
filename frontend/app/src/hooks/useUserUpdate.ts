// app/src/hooks/useUserUpdate.ts
import { useState } from "react";
import { updateUser as apiUpdateUser } from "../services/api/user"; // APIリクエストを扱う
import { UserUpdate } from "../services/interfaces";
import { useAuth } from "../context/AuthContext";

export const useUserUpdate = () => {
  const { user, setUser } = useAuth(); // setUserを使ってユーザー情報を更新
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateUser = async (userData: UserUpdate) => {
    if (!user) {
      setUpdateError("User not found");
      return;
    }

    try {
      setIsUpdating(true);
      const updatedUser = await apiUpdateUser(user.id, userData); // ユーザーIDをAPI関数に渡す
      setUser(updatedUser); // 現在のユーザー情報を更新
      setUpdateError(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      setUpdateError("Failed to update user information");
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateUser, isUpdating, updateError };
};
