import { Outlet, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    try {
      await apiRequest("/logout.php");
    } catch {
      // ignore and continue
    }
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Platform management and monitoring tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 h-fit">
            <AdminSidebar onLogout={logout} />
          </aside>

          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}

