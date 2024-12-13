// app/src/routes/AppRouter.tsx
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Booking from "../pages/Booking";
import CheckInList from "../pages/CheckInList";
import CreateEvent from "../pages/CreateEvent";
import Login from "../pages/Login";
import ManageEvent from "../pages/ManageEvent";
import ManageUser from "../pages/ManageUser";
import Register from "../pages/Register";
import ReservationList from "../pages/ReservationList";
import PrivateRoute from "./PrivateRoute";

// ページ遷移時にページトップにスクロールする
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 「予約する」 */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Booking />
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

        {/* 「予約管理」 */}
        <Route
          path="/check-in-list"
          element={
            <PrivateRoute>
              <CheckInList />
            </PrivateRoute>
          }
        />

        {/* 「ユーザー管理」 */}
        <Route
          path="/manage-user"
          element={
            <PrivateRoute>
              <ManageUser />
            </PrivateRoute>
          }
        />

        {/* 「イベント管理」 */}
        <Route
          path="/manage-event"
          element={
            <PrivateRoute>
              <ManageEvent />
            </PrivateRoute>
          }
        />

        {/* 「新規イベント作成」 */}
        <Route
          path="/manage-event/create"
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          }
        />

        {/* ログインページ */}
        <Route path="/login" element={<Login />} />

        {/* 登録ページ */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
};

export default AppRouter;
