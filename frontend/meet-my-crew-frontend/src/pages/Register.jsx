import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
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
        role,
        region,
        city,
        password,
      });
      navigate("/login");
    } catch (error) {
      setErr(error.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10">
        <div className="grid md:grid-cols-2">
          {/* Left panel */}
          <div className="p-10 text-white bg-gradient-to-b from-white/5 to-white/0">
            <div className="text-2xl font-semibold mb-10">Meet My Crew</div>

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Create Account
            </h1>
            <p className="text-white/70 mb-8">
              Join and start connecting with creatives in your city.
            </p>

            <ul className="space-y-4 text-white/80">
              <li className="flex gap-3">
                <span className="text-blue-300">✓</span>
                <span>Create your professional profile</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-300">✓</span>
                <span>Showcase your portfolio & skills</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-300">✓</span>
                <span>Find teams and collaborate faster</span>
              </li>
            </ul>

            <div className="mt-12 text-white/50 text-sm">
              © 2026 Meet My Crew | HND Software Project
            </div>
          </div>

          {/* Right panel */}
          <div className="p-10 bg-white/90">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Register</h2>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Login
              </Link>
            </div>

            <p className="text-slate-600 mb-8">
              Fill in your details to create an account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Role (e.g Actor)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>

              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {err && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  {err}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition mt-2"
              >
                Create Account
              </button>

              <p className="text-sm text-slate-600 text-center pt-4">
                Already have an account?{" "}
                <Link className="text-blue-700 font-medium" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}