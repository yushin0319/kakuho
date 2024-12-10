// app/src/components/Layout.tsx
import { Container } from "@mui/material";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // ログインページや新規登録ページかどうかを判定
  const isLoginOrRegisterPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <Container sx={{ p: 0, m: 0 }}>
      {!isLoginOrRegisterPage && <Header />}
      <Container
        fixed
        sx={{
          mt: 6,
          py: 4,
          px: 0,
        }}
      >
        {children}
      </Container>
    </Container>
  );
};

export default Layout;
