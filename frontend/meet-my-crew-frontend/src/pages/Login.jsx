import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Top bar space already handled by Navbar, but keep background consistent */}
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT PANEL */}
            <div className="relative p-10 md:p-12 text-white">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={{
                  backgroundImage: "url(/src/assets/bg.jpg)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
              <div className="relative">
                <h1 className="text-4xl font-semibold tracking-wide mb-4">
                  Welcome Back
                </h1>
                <p className="text-white/80 mb-8">
                  Log in to connect with creatives near you.
                </p>

                <div className="space-y-4 text-white/90">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Find local creative professionals</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Build your production crew</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Collaborate on film & media projects</p>
                  </div>
                </div>

                <p className="mt-10 text-sm text-white/70">
                  © 2026 Meet My Crew | HND Software Project.
                </p>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="p-10 md:p-12 bg-white/10 backdrop-blur-sm">
              <div className="max-w-md">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  Log In
                </h2>
                <p className="text-white/70 mb-8">
                  Log in to connect with creatives near you.
                </p>

                <label className="block text-white/80 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 mb-5 outline-none focus:border-blue-400"
                />

                <label className="block text-white/80 text-sm mb-2">
                  Password
                </label>
                <div className="relative mb-4">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-md bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 pr-10 outline-none focus:border-blue-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                    👁
                  </span>
                </div>

                <label className="flex items-center gap-2 text-white/80 text-sm mb-6">
                  <input type="checkbox" className="accent-blue-500" />
                  Remember Me
                </label>

                <button className="w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white py-3 font-semibold shadow-lg shadow-blue-600/20">
                  Log In
                </button>

                <div className="text-center text-white/70 mt-6 text-sm">
                  <button className="hover:text-white">Forgot password?</button>
                </div>

                <div className="my-6 h-px bg-white/20" />

                <p className="text-center text-white/80 text-sm">
                  Don’t have an account?{" "}
                  <Link to="/register" className="text-blue-300 hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}