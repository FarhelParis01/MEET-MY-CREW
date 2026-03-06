import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const GET_USERS_URL = "http://localhost/meet-my-crew/backend/public/admin/get-users.php";
const SUSPEND_USER_URL = "http://localhost/meet-my-crew/backend/public/admin/suspend-user.php";
const DELETE_USER_URL = "http://localhost/meet-my-crew/backend/public/admin/delete-user.php";
const FALLBACK_USER_STATUS_URL = "http://localhost/meet-my-crew/backend/public/admin-user-status.php";

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function parseJsonSafe(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingUserId, setActingUserId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(GET_USERS_URL, { credentials: "include" });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch users");
      }

      setUsers(normalizeUsers(data));
    } catch (err) {
      setUsers([]);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => String(a.full_name || "").localeCompare(String(b.full_name || ""))),
    [users]
  );

  async function handleSuspendUser(userId) {
    setActingUserId(userId);
    setError("");
    setNotice("");

    try {
      let response = await fetch(SUSPEND_USER_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      let data = await parseJsonSafe(response);

      if (!response.ok) {
        response = await fetch(FALLBACK_USER_STATUS_URL, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, status: "suspended" }),
        });
        data = await parseJsonSafe(response);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to suspend user");
      }

      setUsers((prev) =>
        prev.map((u) => (String(u.user_id) === String(userId) ? { ...u, status: "suspended" } : u))
      );
      setNotice(data?.message || "User suspended");
    } catch (err) {
      setError(err.message || "Failed to suspend user");
    } finally {
      setActingUserId(null);
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm("Delete this user account? This action cannot be undone.");
    if (!confirmed) return;

    setActingUserId(userId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(DELETE_USER_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => String(u.user_id) !== String(userId)));
      setNotice(data?.message || "User deleted");
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Users</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage platform users and account status.</p>
      </div>

      {notice ? (
        <Card className="p-4 border-emerald-200 dark:border-emerald-700">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>
        </Card>
      ) : null}

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">City</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Account Type</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const userId = user.user_id || user.id;
                  const isSuspended = String(user.status || "").toLowerCase() === "suspended";
                  const isActing = actingUserId && String(actingUserId) === String(userId);

                  return (
                    <tr key={userId} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{user.full_name || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.role || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.city || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.account_type || "user"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}
                        >
                          {user.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="neutral"
                            className="px-3 py-1 text-xs"
                            onClick={() => navigate(`/creative/${encodeURIComponent(userId)}`)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-3 py-1 text-xs"
                            disabled={isSuspended || isActing}
                            onClick={() => handleSuspendUser(userId)}
                          >
                            Suspend User
                          </Button>
                          <Button
                            variant="neutral"
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            disabled={isActing}
                            onClick={() => handleDeleteUser(userId)}
                          >
                            Delete User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
