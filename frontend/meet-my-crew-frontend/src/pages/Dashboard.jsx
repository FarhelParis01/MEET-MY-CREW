import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/check-session.php")
      .then((data) => setUser(data.user))
      .catch((e) => setErr(e.message));
  }, []);

  async function logout() {
    await apiRequest("/logout.php", "GET");
    navigate("/login");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {user ? (
        <>
          <p>Welcome, {user.full_name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}