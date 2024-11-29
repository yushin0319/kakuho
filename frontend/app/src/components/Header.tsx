import { useState } from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import UserInfo from "./UserInfo";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth(); // 認証情報を取得するフック
  const [isModalOpen, setIsModalOpen] = useState(false); // ユーザー情報モーダル

  const handleUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AppBar
      sx={{
        marginBottom: 4,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* ナビゲーションボタン */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button component={NavLink} to="/" color="inherit">
            予約する
          </Button>
          <Button component={NavLink} to="/my-reservations" color="inherit">
            マイチケット
          </Button>
          <Button component={NavLink} to="/manage-list" color="inherit">
            予約管理
          </Button>
          <Button component={NavLink} to="/manage-user" color="inherit">
            ユーザー管理
          </Button>
          <Button component={NavLink} to="/manage-event" color="inherit">
            イベント管理
          </Button>
        </Box>

        {/* ユーザー情報ボタン */}
        <Button color="inherit" onClick={handleUserClick}>
          {user?.nickname || user?.email || "ゲスト"}
        </Button>
      </Toolbar>

      {/* ユーザー情報モーダル */}
      {isModalOpen && <UserInfo onClose={handleCloseModal} />}
    </AppBar>
  );
};

export default Header;
