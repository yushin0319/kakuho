import React from "react";
import { Link } from "react-router-dom";

// ユーザーのロールがAdminかどうかをチェックするための仮の状態（例として）
const isAdmin = true; // 管理者かどうかのフラグ（本番では認証状態に基づく）

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/reservations">My Reservations</Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
