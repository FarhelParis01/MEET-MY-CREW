import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-10 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Meet My Crew</h1>

      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-400">
          Home
        </Link>
        <Link to="/" className="hover:text-blue-400">
          Login
        </Link>
        <Link
          to="/register"
          className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500"
        >
          Register
        </Link>
      </div>
    </div>
  );
}