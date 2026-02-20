import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await apiRequest("/login.php", "POST", { email, password });
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p style={{ color: "red" }}>{err}</p>}

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}