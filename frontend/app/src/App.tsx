import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
/*
import Home from "./pages/Home";
import MyReservations from "./pages/MyReservations";
import AdminReservations from "./pages/AdminReservations";
*/
import Login from "./pages/Login";
import Register from "./pages/Register";

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/*
        <Route path="/" element={<Home />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/admin" element={<AdminReservations />} />
        */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Layout>
  );
};

export default App;
