// app/src/routes/AppRouter.tsx
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Booking from "../pages/Booking";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ReservationList from "../pages/ReservationList";
import ManageList from "../pages/ManageList";
import ManageUser from "../pages/ManageUser";
import ManageEvent from "../pages/ManageEvent";
import CreateEvent from "../components/CreateEvent";

const AppRouter = () => {
  return (
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
        path="/manage-list"
        element={
          <PrivateRoute>
            <ManageList />
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
  );
};

export default AppRouter;
