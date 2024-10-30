// app/src/components/Layout.tsx
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import "../assets/styles/Layout.scss";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // ログインページや新規登録ページかどうかを判定
  const isLoginOrRegisterPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="layout">
      {!isLoginOrRegisterPage ? (
        <Header />
      ) : (
        <div className="login-header-bar">
          {/* ログイン・新規登録ページ用のオレンジバー */}
        </div>
      )}
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
