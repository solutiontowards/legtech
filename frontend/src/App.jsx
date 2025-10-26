import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import HomeLayout from "./components/layout/HomeLayout";
import NotFound from "./components/common/NotFound";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";

const App = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
      </Route>
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default App;
