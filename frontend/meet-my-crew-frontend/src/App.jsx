import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Optional fallback (very important) */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}