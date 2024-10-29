// AppRouter.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ReservationList from "../pages/ReservationList";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 「予約する」 */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* 「マイチケット」 */}
      <Route
        path="/my-reservations"
        element={
          <PrivateRoute>
            <ReservationList />
          </PrivateRoute>
        }
      />

      {/* ログインページ */}
      <Route path="/login" element={<Login />} />

      {/* 登録ページ */}
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRouter;
