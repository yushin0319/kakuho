import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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
