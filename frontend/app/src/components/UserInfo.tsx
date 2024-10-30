// app/src/components/UserInfo.tsx
import { useState } from "react";
import { useUserUpdate } from "../hooks/useUserUpdate";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

interface UserInfoProps {
  onClose: () => void;
}

const UserInfo = ({ onClose }: UserInfoProps) => {
  const { user } = useAuth();
  const { updateUser, isUpdating, updateError } = useUserUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      await updateUser({ nickname, email });
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <Modal onClose={onClose}>
      {!isEditing ? (
        <>
          <h3>ユーザー情報</h3>
          <p>ニックネーム: {nickname}</p>
          <p>メールアドレス: {email}</p>
          <button onClick={handleEditClick}>更新する</button>
        </>
      ) : (
        <>
          <h3>ユーザー情報を更新</h3>
          <label>
            ニックネーム:
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>
          <label>
            メールアドレス:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button onClick={handleSaveClick} disabled={isUpdating}>
            保存
          </button>
          {updateError && <p className="error">{updateError}</p>}
        </>
      )}
    </Modal>
  );
};

export default UserInfo;
