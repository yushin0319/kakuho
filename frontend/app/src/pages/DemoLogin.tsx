import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useAppData } from "../context/AppData";
import { useAuth } from "../context/AuthContext";

const DemoLogin = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { reservations, loading } = useAppData();

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error("Quick login failed:", error);
      alert("ログインに失敗しました。");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (user.is_admin) {
        navigate("/check-in-list");
      } else {
        if (reservations.length > 0) {
          navigate("/my-reservations");
        } else {
          navigate("/booking");
        }
      }
    }
  }, [loading, reservations]);

  if (loading) return <LoadingScreen />;

  return (
    <Container sx={{ mt: 5, textAlign: "center", justifyItems: "center" }}>
      <Box
        display="flex"
        gap={2}
        sx={{ alignItems: "center", mb: 2, px: "auto" }}
      >
        <img
          src="logo.png"
          alt="Logo"
          style={{ width: "60px", height: "auto" }}
        />
        <Typography variant="h4">Kakuho</Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Your Event Management System
      </Typography>
      <Typography variant="body1" sx={{ mt: 5, color: "text.secondary" }}>
        体験モード
      </Typography>
      <Box display="flex" justifyContent="center" flexDirection="column">
        <Typography variant="caption" color="text.secondary">
          以下のボタンで、サンプルアカウントでログインします。
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ログインまで数秒かかる場合があります。
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* 管理者ログインボタン */}
        <Box display="flex" gap={2} sx={{ width: "100%" }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() =>
              handleQuickLogin("admin@example.com", "adminpassword")
            }
            sx={{
              py: 3,
            }}
          >
            <Typography variant="h6">管理者</Typography>
          </Button>

          {/* ユーザーログインボタン */}
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() =>
              handleQuickLogin("sample@example.com", "userpassword")
            }
            sx={{
              py: 3,
              px: 4,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="h6">一般ユーザー</Typography>
          </Button>
        </Box>
      </Box>

      {/* 通常のログインページへのリンク */}
      <Typography
        variant="body2"
        sx={{ mt: 4, color: "text.secondary", textAlign: "center" }}
      >
        <Link to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
          通常のログイン画面へ
        </Link>
      </Typography>
    </Container>
  );
};

export default DemoLogin;
