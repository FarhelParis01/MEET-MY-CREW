import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const GET_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/admin/get-portfolio.php";
const DELETE_PORTFOLIO_URL = "http://localhost/meet-my-crew/backend/public/admin/delete-portfolio.php";

function normalizeItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
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

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPortfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingItemId, setActingItemId] = useState(null);

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(GET_PORTFOLIO_URL, { credentials: "include" });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch portfolio items");
      }

      setItems(normalizeItems(data));
    } catch (err) {
      setItems([]);
      setError(err.message || "Failed to fetch portfolio items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) =>
        String(b?.created_at || "").localeCompare(String(a?.created_at || ""))
      ),
    [items]
  );

  async function handleDelete(itemId) {
    const confirmed = window.confirm("Delete this portfolio item?");
    if (!confirmed) return;

    setActingItemId(itemId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(DELETE_PORTFOLIO_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete portfolio item");
      }

      setNotice(data?.message || "Portfolio item deleted");
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to delete portfolio item");
    } finally {
      setActingItemId(null);
    }
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Portfolio</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review and manage portfolio items across the platform.
        </p>
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
          <table className="w-max min-w-[1040px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Title</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Creator Name</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Description</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Created At</th>
                <th className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    Loading portfolio items...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500 dark:text-slate-400">
                    No portfolio items found.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const itemId = item.item_id || item.id;
                  const isActing = actingItemId && String(actingItemId) === String(itemId);

                  return (
                    <tr key={itemId || `${item.title}-${item.created_at}`} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100">
                        {item.title || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {item.creator_name || "-"}
                      </td>
                      <td className="max-w-[420px] px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div className="line-clamp-2 min-w-[280px]">
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-nowrap items-center gap-2">
                          <Button
                            variant="neutral"
                            className="rounded-md px-2.5 py-1.5 text-xs"
                            disabled={!item.video_link}
                            onClick={() => window.open(item.video_link, "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink size={14} />
                            View
                          </Button>
                          <Button
                            variant="neutral"
                            className="rounded-md px-2.5 py-1.5 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            disabled={!itemId || isActing}
                            onClick={() => handleDelete(itemId)}
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
