// app/src/components/Header.tsx
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import UserInfo from "./UserInfo";
import "../assets/styles/Header.scss";
import { useAuth } from "../context/AuthContext";

// 仮の管理者フラグ（認証システム導入時に置き換える）
const isAdmin = false;

const Header = () => {
  const { user } = useAuth(); // 認証情報を取得するフック
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Homeページかイベント詳細ページかを判定してアクティブ状態に
  const isHomeActive =
    location.pathname === "/" || location.pathname.startsWith("/events");

  const handleUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="header">
      <nav className="nav-list">
        <li>
          <NavLink to="/" className={isHomeActive ? "active" : ""}>
            予約する
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/my-reservations"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            マイチケット
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/manage-list"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            予約管理
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/manage-user"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            ユーザー管理
          </NavLink>
        </li>
        {isAdmin && ( // 管理者の場合だけ表示
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Admin
            </NavLink>
          </li>
        )}
        <div className="user-info" onClick={handleUserClick}>
          {user?.nickname || user?.email}
        </div>
      </nav>

      {isModalOpen && <UserInfo onClose={handleCloseModal} />}
    </header>
  );
};

export default Header;
