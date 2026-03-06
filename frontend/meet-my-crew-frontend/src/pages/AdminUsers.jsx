import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const GET_USERS_URL = "http://localhost/meet-my-crew/backend/public/admin/get-users.php";
const DELETE_USER_URL = "http://localhost/meet-my-crew/backend/public/admin/delete-user.php";
const USER_STATUS_URL = "http://localhost/meet-my-crew/backend/public/admin-user-status.php";

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = [headers.map(escapeCell).join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

  function handleDownloadUsers() {
    const rows = sortedUsers.map((user) => [
      user.user_id || user.id || "",
      user.full_name || "",
      user.role || "",
      user.city || "",
      user.account_type || "user",
      user.status || "active",
    ]);

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCsv(
      `admin-users-${stamp}.csv`,
      ["user_id", "full_name", "role", "city", "account_type", "status"],
      rows
    );
  }

  async function handleToggleUserStatus(userId, currentStatus) {
    const nextStatus = String(currentStatus || "").toLowerCase() === "suspended" ? "active" : "suspended";

    setActingUserId(userId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(USER_STATUS_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, status: nextStatus }),
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update user status");
      }

      setUsers((prev) =>
        prev.map((u) => (String(u.user_id || u.id) === String(userId) ? { ...u, status: nextStatus } : u))
      );
      setNotice(data?.message || `User ${nextStatus}`);
    } catch (err) {
      setError(err.message || "Failed to update user status");
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

      setUsers((prev) => prev.filter((u) => String(u.user_id || u.id) !== String(userId)));
      setNotice(data?.message || "User deleted");
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActingUserId(null);
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Users</h2>
        <Button
          variant="neutral"
          className="rounded-md px-3 py-2 text-sm"
          onClick={handleDownloadUsers}
          disabled={loading || sortedUsers.length === 0}
        >
          <Download size={16} />
          Download Users
        </Button>
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

      <Card className="min-w-0 p-0 overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-max min-w-[1120px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Name</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Role</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">City</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Account Type</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Status</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Actions</th>
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
                  const status = String(user.status || "active").toLowerCase();
                  const isSuspended = status === "suspended";
                  const isActing = actingUserId && String(actingUserId) === String(userId);

                  return (
                    <tr key={userId} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">{user.full_name || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{user.role || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{user.city || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{user.account_type || "user"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isSuspended
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-nowrap items-center gap-2">
                          <Button
                            variant="neutral"
                            className="rounded-md px-2.5 py-1.5 text-xs"
                            onClick={() => navigate(`/creative/${encodeURIComponent(userId)}`)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant={isSuspended ? "primary" : "secondary"}
                            className="rounded-md px-2.5 py-1.5 text-xs"
                            disabled={isActing}
                            onClick={() => handleToggleUserStatus(userId, status)}
                          >
                            {isSuspended ? "Activate" : "Suspend"}
                          </Button>
                          <Button
                            variant="neutral"
                            className="rounded-md px-2.5 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            disabled={isActing}
                            onClick={() => handleDeleteUser(userId)}
                          >
                            Delete
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



