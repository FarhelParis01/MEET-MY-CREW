import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen bg-[#0b1220]">
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
                  Join Meet My Crew
                </h1>
                <p className="text-white/80 mb-8">
                  Connect with local actors, editors, producers, and creators to
                  build your crew and collaborate more efficiently.
                </p>

                <div className="space-y-4 text-white/90">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Find local creatives in your area</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Build a professional portfolio</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 text-blue-300">✔</span>
                    <p>Send collaboration requests</p>
                  </div>
                </div>

                <p className="mt-10 text-sm text-white/70">
                  © 2026 Meet My Crew | HND Software Project
                </p>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="p-10 md:p-12 bg-white/10 backdrop-blur-sm">
              <div className="max-w-md">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  Create an Account
                </h2>
                <p className="text-white/70 mb-8">
                  Sign up to find local creative professionals.
                </p>

                <label className="block text-white/80 text-sm mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-md bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 mb-5 outline-none focus:border-blue-400"
                />

                <label className="block text-white/80 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 mb-5 outline-none focus:border-blue-400"
                />

                <label className="block text-white/80 text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Select role"
                  className="w-full rounded-md bg-white/20 border border-white/20 text-white placeholder:text-white/50 px-4 py-3 mb-5 outline-none focus:border-blue-400"
                />

                <label className="block text-white/80 text-sm mb-2">
                  Role
                </label>
                <select className="w-full rounded-md bg-white/20 border border-white/20 text-white px-4 py-3 mb-5 outline-none focus:border-blue-400">
                  <option className="text-black">--Select Role--</option>
                  <option className="text-black">Actor</option>
                  <option className="text-black">Editor</option>
                  <option className="text-black">Producer</option>
                  <option className="text-black">Director</option>
                </select>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Region
                    </label>
                    <select className="w-full rounded-md bg-white/20 border border-white/20 text-white px-4 py-3 outline-none focus:border-blue-400">
                      <option className="text-black"> </option>
                      <option className="text-black">Île-de-France</option>
                      <option className="text-black">Occitanie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      City
                    </label>
                    <select className="w-full rounded-md bg-white/20 border border-white/20 text-white px-4 py-3 outline-none focus:border-blue-400">
                      <option className="text-black"> </option>
                      <option className="text-black">Paris</option>
                      <option className="text-black">Toulouse</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-white/80 text-sm mb-6">
                  <input type="checkbox" className="accent-blue-500" />
                  I agree to the{" "}
                  <span className="text-blue-300">Terms of Service</span> and{" "}
                  <span className="text-blue-300">Privacy Policy</span>
                </label>

                <button className="w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white py-3 font-semibold shadow-lg shadow-blue-600/20">
                  Create Account
                </button>

                <p className="text-center text-white/80 text-sm mt-6">
                  Already have an account?{" "}
                  <Link to="/" className="text-blue-300 hover:underline">
                    Login
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