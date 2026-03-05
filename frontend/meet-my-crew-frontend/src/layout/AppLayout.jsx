import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  return (
    <div className="mmc-app">
      <Sidebar />
      <div className="mmc-main">
        <Topbar />
        <div className="mmc-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}