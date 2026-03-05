import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Discover from "./pages/Discover";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";

// placeholder pages for now
const Creatives = () => <div className="mmc-pageTitle">Search Results</div>;

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
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/creatives" element={<Creatives />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/requests" element={<Requests />} />
      </Route>
    </Routes>
  );
}
