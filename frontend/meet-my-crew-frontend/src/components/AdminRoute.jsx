import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiRequest, isAdminUser } from "../services/api";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const data = await apiRequest("/my-profile.php");
        if (!mounted) return;
        setStatus(isAdminUser(data) ? "allowed" : "denied");
      } catch {
        if (!mounted) return;
        setStatus("denied");
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Checking admin access...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}
