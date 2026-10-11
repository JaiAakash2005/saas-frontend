import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TemplateDetails from "./pages/TemplateDetails";
import Templates from "./pages/Templates";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import ChangePassword from "./pages/ChangePassword";
import ChangePasswordByPass from "./pages/ChangePasswordByPass";
import Favorites from "./pages/Favorites";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/templates/:id" element={<TemplateDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/change-password-pass"
          element={<ChangePasswordByPass />}
        />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </>
  );
}
