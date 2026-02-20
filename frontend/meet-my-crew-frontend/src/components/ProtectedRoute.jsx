import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    apiRequest("/check-session.php")
      .then(() => setOk(true))
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}