import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Building2,
  Users,
  ChevronDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");

  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const inputClassName =
    "w-full rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 px-11 py-3 outline-none focus:border-[#1b4bff] focus:ring-2 focus:ring-[#1b4bff]/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400";
  const selectBaseClassName =
    "w-full appearance-none rounded-md bg-white border border-slate-200 px-11 py-3 outline-none focus:border-[#1b4bff] focus:ring-2 focus:ring-[#1b4bff]/20 dark:bg-slate-900 dark:border-slate-700 dark:[color-scheme:dark]";
  const selectOptionClassName =
    "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100";
  const selectPlaceholderOptionClassName =
    "bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400";

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!agree) return setErr("You must agree to the Terms.");

    setLoading(true);
    try {      await registerUser({
        full_name: fullName,
        email,
        password,
        role,
        region,
        city,
      });

      navigate("/login");
    } catch (error) {
      setErr(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create an Account"
      subtitle="Sign up to find local creative professionals."
      leftTitle="Join Meet My Crew"
      leftText="Connect with local actors, editors, producers, and creators to build your crew and collaborate more efficiently."
      bullets={[
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Find local creatives in your area",
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Build a professional portfolio",
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-[#18d2c0]" />,
          text: "Send collaboration requests",
        },
      ]}
      bgImage="/src/assets/bg.jpg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className={inputClassName}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={inputClassName}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClassName}
              required
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
            Role
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50 pointer-events-none" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${selectBaseClassName} ${
                role
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              required
            >
              <option value="" className={selectPlaceholderOptionClassName}>
                -- Select Role --
              </option>
              <option value="Actor" className={selectOptionClassName}>
                Actor
              </option>
              <option value="Editor" className={selectOptionClassName}>
                Editor
              </option>
              <option value="Producer" className={selectOptionClassName}>
                Producer
              </option>
              <option value="Director" className={selectOptionClassName}>
                Director
              </option>
              <option value="Cinematographer" className={selectOptionClassName}>
                Cinematographer
              </option>
            </select>
          </div>
        </div>

        {/* Region + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
              Region
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50 pointer-events-none" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={`${selectBaseClassName} ${
                  region
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                required
              >
                <option value="" className={selectPlaceholderOptionClassName}>
                  -- Select Region --
                </option>
                <option value="Centre" className={selectOptionClassName}>
                  Centre
                </option>
                <option value="Littoral" className={selectOptionClassName}>
                  Littoral
                </option>
                <option value="West" className={selectOptionClassName}>
                  West
                </option>
                <option value="North West" className={selectOptionClassName}>
                  North West
                </option>
                <option value="South West" className={selectOptionClassName}>
                  South West
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-700 dark:text-white/80">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-white/50 pointer-events-none" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${selectBaseClassName} ${
                  city
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
                required
              >
                <option value="" className={selectPlaceholderOptionClassName}>
                  -- Select City --
                </option>
                <option value="Yaounde" className={selectOptionClassName}>
                  Yaounde
                </option>
                <option value="Douala" className={selectOptionClassName}>
                  Douala
                </option>
                <option value="Buea" className={selectOptionClassName}>
                  Buea
                </option>
                <option value="Bamenda" className={selectOptionClassName}>
                  Bamenda
                </option>
                <option value="Bafoussam" className={selectOptionClassName}>
                  Bafoussam
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-white/80">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 accent-[#1b4bff]"
          />
          <span>
            I agree to the{" "}
            <button type="button" className="text-[#1b4bff] hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-[#1b4bff] hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>

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
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-white/75">
          Already have an account?{" "}
          <Link to="/login" className="text-[#18d2c0] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
