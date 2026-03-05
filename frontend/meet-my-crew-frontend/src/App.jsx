import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// placeholder pages for now
const Discover = () => <div className="mmc-pageTitle">Discover</div>;
const Creatives = () => <div className="mmc-pageTitle">Search Results</div>;
const Messages = () => <div className="mmc-pageTitle">Messages</div>;
const Requests = () => <div className="mmc-pageTitle">Collaboration Requests</div>;

import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Everything below shares the SAME sidebar/topbar */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/creatives" element={<Creatives />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/requests" element={<Requests />} />
      </Route>
    </Routes>
  );
}