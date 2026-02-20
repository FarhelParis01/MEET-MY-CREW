import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Meet My Crew</h1>
      <p>Connect with creatives near you.</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Go Dashboard (protected)</Link>
      </div>
    </div>
  );
}