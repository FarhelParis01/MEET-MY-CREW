import { useEffect, useState } from "react";
import Card from "../components/ui/Card";

const ADMIN_STATS_URL = "http://localhost/meet-my-crew/backend/public/admin/get-stats.php";

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProjects: 0,
  totalPortfolioItems: 0,
  totalMessages: 0,
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStats(payload) {
  return {
    totalUsers: toNumber(payload?.total_users ?? payload?.users ?? payload?.totalUsers),
    totalProjects: toNumber(payload?.total_projects ?? payload?.projects ?? payload?.totalProjects),
    totalPortfolioItems: toNumber(
      payload?.total_portfolio_items ?? payload?.portfolio_items ?? payload?.portfolio ?? payload?.totalPortfolioItems
    ),
    totalMessages: toNumber(payload?.total_messages ?? payload?.messages ?? payload?.totalMessages),
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(ADMIN_STATS_URL, { credentials: "include" });
        const text = await response.text();

        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load admin stats");
        }

        if (!mounted) return;
        setStats(normalizeStats(data));
      } catch (err) {
        if (!mounted) return;
        setStats(DEFAULT_STATS);
        setError(err.message || "Failed to load admin stats");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Projects", value: stats.totalProjects },
    { label: "Total Portfolio Items", value: stats.totalPortfolioItems },
    { label: "Total Messages", value: stats.totalMessages },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Platform-wide admin statistics.</p>
      </div>

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "..." : card.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
