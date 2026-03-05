import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
  e.preventDefault();
  setErr("");
  setLoading(true);

  try {
    await loginUser({ email, password });
    navigate("/dashboard");

  } catch (error) {
    setErr(error.message || "Invalid email or password.");
  } finally {
    setLoading(false);
  }
}

  return (
    <AuthShell
      title="Log In"
      subtitle="Log in to connect with creatives near you."
      leftTitle="Welcome Back"
      leftText="Log in to connect with creatives near you."
      bullets={[
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Find local creative professionals",
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Build your production crew",
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Collaborate on film & media projects",
        },
      ]}
      bgImage="/src/assets/bg.jpg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400
                         px-11 py-3 outline-none focus:border-[#1b4bff] focus:ring-2 focus:ring-[#1b4bff]/20
                         dark:bg-white/10 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
            <input
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400
                         px-11 py-3 pr-12 outline-none focus:border-[#1b4bff] focus:ring-2 focus:ring-[#1b4bff]/20
                         dark:bg-white/10 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
              required
            />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                         text-slate-600 hover:bg-slate-100
                         dark:text-white/70 dark:hover:bg-white/10"
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[#1b4bff]"
            />
            Remember Me
          </label>

          <button
            type="button"
            className="text-sm text-[#1b4bff] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {err}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#1b4bff] hover:bg-[#143be0] text-white py-3 font-semibold
                     shadow-lg shadow-[#1b4bff]/20 disabled:opacity-70 disabled:cursor-not-allowed
                     inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>

        {/* Footer link */}
        <p className="text-center text-sm text-slate-600 dark:text-white/75">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#18d2c0] hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
