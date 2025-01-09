import {
  AppBar,
  Box,
  Button,
  Divider,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppData";
import { useAuth } from "../context/AuthContext";
import UserInfo from "./UserInfo";

const Header = () => {
  const { user } = useAuth(); // 認証情報を取得するフック
  const { reservations } = useAppData(); // 予約情報を取得するフック
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // ユーザー情報モーダル

  const goToTopPage = () => {
    if (reservations.length > 0) {
      navigate("/my-reservations");
    } else {
      navigate("/booking");
    }
  };

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
          {user?.is_admin ? (
            <>
              <Button component={NavLink} to="/check-in-list" color="inherit">
                <Typography variant="caption">予約一覧</Typography>
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button component={NavLink} to="/manage-user" color="inherit">
                <Typography variant="caption">ユーザ一覧</Typography>
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button component={NavLink} to="/manage-event" color="inherit">
                <Typography variant="caption">イベント管理</Typography>
              </Button>
              <Divider orientation="vertical" flexItem />
            </>
          ) : (
            <>
              <Button onClick={goToTopPage} color="inherit" sx={{ p: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="public/logo.png"
                    alt="Logo"
                    style={{ width: "35px", height: "auto" }}
                  />
                </Box>
              </Button>
              <Button component={NavLink} to="/booking" color="inherit">
                <Typography variant="caption">予約する</Typography>
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button component={NavLink} to="/my-reservations" color="inherit">
                <Typography variant="caption">マイチケット</Typography>
              </Button>
              <Divider orientation="vertical" flexItem />
            </>
          )}
        </Box>

        {/* ユーザー情報ボタン */}
        <Button color="inherit" onClick={handleUserClick}>
          <Typography variant="caption" color="secondary">
            {user?.nickname || user?.email || "ゲスト"}
          </Typography>
        </Button>
      </Toolbar>

      {/* ユーザー情報モーダル */}
      {isModalOpen && <UserInfo onClose={handleCloseModal} />}
    </AppBar>
  );
};

export default Header;
