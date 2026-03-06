import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import AdminRoute from "./components/AdminRoute";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Discover from "./pages/Discover";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";
import StartProject from "./pages/StartProject";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import CreativeProfilePage from "./pages/CreativeProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProjects from "./pages/AdminProjects";
import AdminPortfolio from "./pages/AdminPortfolio";

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
        <Route path="/creative/:id" element={<CreativeProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
      </Route>
    </Routes>
  );
}
