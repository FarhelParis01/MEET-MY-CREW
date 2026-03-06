import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Discover from "./pages/Discover";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";
import StartProject from "./pages/StartProject";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";

import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/creatives" element={<Discover />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/start-project" element={<StartProject />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
      </Route>
    </Routes>
  );
}
