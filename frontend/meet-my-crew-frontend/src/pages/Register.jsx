import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Actor");
  const [region, setRegion] = useState("Littoral");
  const [city, setCity] = useState("Douala");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await apiRequest("/register.php", "POST", {
        full_name,
        email,
        password,
        role,
        region,
        city,
      });
      navigate("/login");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Full name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Role (e.g Actor)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <input
          placeholder="Region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p style={{ color: "red" }}>{err}</p>}

        <button type="submit">Create account</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}