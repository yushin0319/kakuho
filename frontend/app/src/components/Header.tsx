import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// 仮の管理者フラグ（認証システム導入時に置き換える）
const isAdmin = true; // 管理者かどうかのフラグ

const Header: React.FC = () => {
  const location = useLocation();

  // Homeページかイベント詳細ページかを判定してアクティブ状態に
  const isHomeActive =
    location.pathname === "/" || location.pathname.startsWith("/events");

  return (
    <header>
      <nav>
        <ul className="nav-list">
          <li>
            <NavLink to="/" className={isHomeActive ? "active" : ""}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reservations"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              My Reservations
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
        </ul>
      </nav>
    </header>
  );
};

export default Header;
